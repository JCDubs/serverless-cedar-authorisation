import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import {
  AuthorizationConfigType,
  AuthorizationService,
  ServiceConfig,
} from '../authorization-service';
import middy from '@middy/core';
import { UserDetailService } from '../user-details';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 'authorization-middleware' });

/**
 * Middy middleware that provides the functionality to load the Cedar Authorization and UserDetails
 * service that will allow implementing services to implement cedar policy authorization.
 *
 * A cached version of the AuthorizationService is created via a call to {getService} static function
 * where the service Cedar policy and schema objects are retrieved from the City Cedar central policy
 * S3 Bucket. The Cedar policy and schema can be refreshed within a warm Lambda environment by providing
 * the cedar-refresh request header with a value of 'true'. Doing so will re-retrieve the policy and
 * schema from the City Cedar central policy S3 Bucket and cache a new instance of the AuthorizationService.
 *
 * Services that use the AuthorizationService must have permission to read from the City Authorization central S3 bucket.
 * This can be achieved through the AWS CDK by retrieving the S3 Bucket from the AuthPolicyStore CDK construct and granting
 * access to the bucket through the bucket construct variable.
 * @param authorizationConfig Service authorization configuration.
 * @param serviceConfig Service configuration.
 * @returns APIGatewayProxyResult
 */
export const loadCedarAuthorization = (
  authorizationConfig: AuthorizationConfigType,
  serviceConfig: ServiceConfig
): middy.MiddlewareObj<APIGatewayProxyEvent, APIGatewayProxyResult> => {
  const before: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult> = async (
    request
  ): Promise<void> => {
    logger.debug('Loading authorization services...', {
      authorizationConfig,
      serviceConfig,
    });

    const refresh =
      request.event.headers && request.event.headers['cedar-refresh']
        ? request.event.headers['cedar-refresh'] === 'true'
        : false;

    UserDetailService.setUserDetails(request.event);
    await AuthorizationService.getService(authorizationConfig, serviceConfig, refresh);
  };
  logger.debug('Authorization services loaded and configured.');
  return {
    before,
  };
};
