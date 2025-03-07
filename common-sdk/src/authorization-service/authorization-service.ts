import * as cedar from '@cedar-policy/cedar-wasm/nodejs';
import { UserDetailService } from '../user-details';
import { AuthorizationConfigType, ServiceConfig } from './types';
import {
  MissingAuthenticatedUserDetailsError,
  MissingAuthorizationActionError,
  MissingAuthorizationPolicyError,
  MissingAuthorizationResourceError,
  MissingAuthorizationSchemaError,
} from '../errors';
import { Logger } from '@aws-lambda-powertools/logger';
import { S3Client } from '../S3';

const logger = new Logger({ serviceName: 'authorization-service' });

const AUTH_POLICY_STORE_BUCKET_SUFFIX = 'auth-policy-store';
const POLICY_FILE_NAME = 'policies.cedar';
const SCHEMA_FILE_NAME = 'schema.cedarschema';

/**
 * The Authorization Service allows implementing services to implement the City Cedar Authorization pattern.
 *
 * The AuthorizationService class provides a cached version of itself through the static {getService} function
 * where the Cedar policy and schema is loaded from the City Cedar policy central S3 bucket.
 *
 * Service/Domain Cedar policies and schemas should be added to the City Cedar policy central S3 bucket via the
 * AuthPolicyStore City CDK Construct (https://cdk.tools.cefcloud.net/construct/auth-policy-store).
 *
 * Services that use the AuthorizationService must have permission to read from the City Authorization central S3 bucket.
 * This can be achieved through the AWS CDK by retrieving the S3 Bucket from the AuthPolicyStore CDK construct and granting
 * access to the bucket through the bucket construct variable.
 *
 * The policy and schema can be refreshed in a warm Lambda environment by providing true as the getService static function
 * refresh value. Doing so will retrieve the policy and schema objects from S3 and cache a new instance of the
 * Authorization Service.
 *
 */
export class AuthorizationService {
  private static s3Client: S3Client;
  private static service: AuthorizationService;
  private readonly authorizationConfig: AuthorizationConfigType;
  private readonly policy: string;
  private readonly schema: string;
  private action: string | undefined;
  private resource: string | undefined;
  private context: Record<string, cedar.CedarValueJson> | undefined;
  private entities: cedar.EntityJson[] | undefined;

  /**
   * Create an instance of the Authorization service.
   * @param policy The cedar policy to use when evaluating requests.
   * @param schema The cedar schema to use when evaluating requests.
   * @param authorizationConfig The service authorization configuration.
   */
  private constructor(
    policy: string,
    schema: string,
    authorizationConfig: AuthorizationConfigType
  ) {
    this.policy = policy;
    this.schema = schema;
    this.authorizationConfig = authorizationConfig;
  }

  /**
   * Set the action the user is attempting to perform.
   * @param action User request action.
   * @returns AuthorizationService.
   */
  setAction(action: string): AuthorizationService {
    this.action = action;
    return this;
  }

  /**
   * Set the Cedar resource name the user is attempting to perform the request on.
   * @param resource The Cedar resource.
   * @returns AuthorizationService
   */
  setResource(resource: string): AuthorizationService {
    this.resource = resource;
    return this;
  }

  /**
   * Add an entity to the Cedar authorization request.
   * @param entity The entity to add to the Cedar authorization request.
   * @returns AuthorizationService
   */
  addEntity(entity: cedar.EntityJson): AuthorizationService {
    if (!this.entities) {
      this.entities = [];
    }
    this.entities.push(entity);
    return this;
  }

  /**
   * Set an array of entities to use in the Cedar authorization request.
   * @param entities The array of entities.
   * @returns AuthorizationService
   */
  setEntities(entities: cedar.EntityJson[]): AuthorizationService {
    this.entities = entities;
    return this;
  }

  /**
   * Validate the Authorization service authorization properties.
   * @throws MissingAuthorizationActionError
   * @throws MissingAuthorizationResourceError
   * @throws MissingAuthorizationPolicyError
   * @throws MissingAuthorizationSchemaError
   */
  private validateAuthorizationProperties() {
    // Validate that a username and roles is available.
    if (!UserDetailService.getUserName() || !UserDetailService.getRoles()) {
      logger.error('Authenticated user username or roles has not been provided');
      throw new MissingAuthenticatedUserDetailsError();
    }

    // Validate the cedar scope
    if (!this.action) {
      logger.error('Cedar authorization action has not been provided');
      throw new MissingAuthorizationActionError();
    }

    // Validate the cedar scope
    if (!this.resource) {
      logger.error('Cedar authorization resource has not been provided');
      throw new MissingAuthorizationResourceError();
    }
  }

  /**
   * Create the Cedar schema object required by the evaluation process.
   * @returns Cedar schema.
   */
  private createSchema(): cedar.Schema {
    try {
      const schema = JSON.parse(this.schema);
      return { json: schema };
    } catch (err) {
      return { human: this.schema };
    }
  }

  /**
   * Construct the Cedar user entity required by the evaluation process.
   * @returns Cedar EntityJson
   */
  private constructUserEntity(): cedar.EntityJson {
    return {
      uid: {
        type: `${this.authorizationConfig.namespace}${this.authorizationConfig.principleType}`,
        id: UserDetailService.getUserName()!,
      },
      attrs: {},
      parents:
        UserDetailService.getRoles()?.map((role) => ({
          type: `${this.authorizationConfig.namespace}${this.authorizationConfig.roleType}`,
          id: role,
        })) ?? [],
    };
  }

  /**
   * Construct the Cedar role entities required by the evaluation process.
   * @returns Cedar EntityJson
   */
  private constructRoleEntities(): cedar.EntityJson[] {
    return (
      UserDetailService.getRoles()?.map((role) => ({
        uid: {
          type: `${this.authorizationConfig.namespace}${this.authorizationConfig.roleType}`,
          id: role,
        },
        attrs: {},
        parents: [],
      })) ?? []
    );
  }

  /**
   * Build the Cedar AuthorizationCall object using the values provided to the
   * Authorization service factory functions.
   * @returns Cedar AuthorizationCall.
   */
  private build(): cedar.AuthorizationCall {
    this.validateAuthorizationProperties();

    const user = this.constructUserEntity();
    const roles = this.constructRoleEntities();

    return {
      principal: {
        type: `${this.authorizationConfig.namespace}${this.authorizationConfig.principleType}`,
        id: UserDetailService.getUserName()!,
      },
      action: {
        type: `${this.authorizationConfig.namespace}Action`,
        id: this.action!,
      },
      resource: {
        type: `${this.authorizationConfig.namespace}${this.authorizationConfig.resourceType}`,
        id: this.resource!,
      },
      context: this.context ?? {},
      schema: this.createSchema(),
      enableRequestValidation: true,
      slice: {
        policies: this.policy,
        entities: [user, ...(this.entities ?? []), ...roles],
        templateInstantiations: [],
      },
    };
  }

  /**
   * Determine whether the user is authorized to perform the requested action based on
   * the user's details, role's and the action the user is attempting to perform on the entity.
   * @returns Whether the user is authorized to perform the requested action.
   */
  isAuthorized(): boolean {
    logger.debug('Authorizing request...');
    const builtAuthRequest = this.build();
    logger.debug('Built Authorization request', { builtAuthRequest });
    const authResult = cedar.isAuthorized(builtAuthRequest);
    logger.debug('Auth Result', { authResult });

    if (authResult.type === 'failure') {
      logger.debug('A problem occurred while authorizing the request', {
        authResult,
      });
      throw Error(authResult.errors.map((error) => error.message).join('\n'));
    }
    return authResult.response.decision === ('Allow' as cedar.Decision);
  }

  /**
   * Get the authorization service.
   * A cached instance of the service is returned if the get function has been previously called.
   * An instance of the service is created replacing the cached service and re-retrieving the Cedar
   * policy and schema from the central S3 bucket if the provided 'refresh'
   * flag is provided as a {true} boolean value.
   * @param authorizationConfig The authorization configuration.
   * @param serviceConfig The service configuration.
   * @param refresh Whether the policy and schema should be refreshed.
   * @returns Promise<AuthorizationService>
   */
  static async getService(
    authorizationConfig: AuthorizationConfigType,
    serviceConfig: ServiceConfig,
    refresh = false
  ): Promise<AuthorizationService> {
    if (!refresh && this.service) {
      logger.debug('Returning cached Authorization service');
      return this.service;
    }

    if (!this.s3Client) {
      this.s3Client = new S3Client();
    }

    const bucket = `${serviceConfig.organisationName}-${AUTH_POLICY_STORE_BUCKET_SUFFIX}`;
    const keyPrefix = `${serviceConfig.serviceName}/policy`;
    let policy: string | undefined;
    let schema: string | undefined;

    try {
      policy = await this.s3Client.getObject(`${keyPrefix}/${POLICY_FILE_NAME}`, bucket);
    } catch (err) {
      logger.error('Policy is not present in the central authorization S3 Bucket', { error: err });
      throw new MissingAuthorizationPolicyError();
    }

    try {
      schema = await this.s3Client.getObject(`${keyPrefix}/${SCHEMA_FILE_NAME}`, bucket);
    } catch (err) {
      logger.error('Schema is not present in the central authorization S3 Bucket', { error: err });
      throw new MissingAuthorizationSchemaError();
    }

    if (!policy) {
      logger.error('Policy is not present in the central authorization S3 Bucket');
      throw new MissingAuthorizationPolicyError();
    }

    if (!schema) {
      logger.error('Schema is not present in the central authorization S3 Bucket');
      throw new MissingAuthorizationSchemaError();
    }

    logger.debug('Policy and Schema loaded', {
      policy,
      schema,
    });
    this.service = new AuthorizationService(policy, schema, authorizationConfig);
    return this.service;
  }
}
