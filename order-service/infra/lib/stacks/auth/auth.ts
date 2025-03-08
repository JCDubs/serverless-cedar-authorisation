import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import {AuthPolicyStore} from 'common-cdk';
import * as s3 from 'aws-cdk-lib/aws-s3';
import path from 'path';
import { SERVICE } from '@infra/constants';
import { Config } from '@infra/types';

export interface AuthStackProps extends cdk.StackProps, Config {}


export class AuthStack extends cdk.Stack {
  readonly userPool: cognito.UserPool;
  readonly userPoolClient: cognito.UserPoolClient;
  readonly identityPool: cognito.CfnIdentityPool;
  readonly policyStoreBucket: s3.IBucket;

  constructor(scope: Construct, id: string, props: AuthStackProps) {
    super(scope, id, props);

    this.userPool = new cognito.UserPool(this, 'orders-user-pool', {
      userPoolName: 'orders-user-pool',
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
    });

    const callBackUrl = 'https://orders.cefcloud.net';

    const userPoolClient = new cognito.UserPoolClient(
      this,
      'customerExclusionsAppClient',
      {
        userPool: this.userPool,
        oAuth: {
          flows: {
            authorizationCodeGrant: true,
          },
          scopes: [
            cognito.OAuthScope.OPENID,
          ],
          callbackUrls: [callBackUrl],
          logoutUrls: [callBackUrl],
        },
        generateSecret: false,
        userPoolClientName: 'orders-client',
        authFlows: {
          adminUserPassword: true,
          userPassword: true,
          userSrp: true,
        },
      },
    );

    this.userPool.addDomain('customerExclusionsAppDomain', {
      cognitoDomain: {
        domainPrefix: 'orders',
      },
    });

    const cfnUserPool = this.userPool.node.defaultChild as cognito.CfnUserPool;
    cfnUserPool.policies = {
      passwordPolicy: {
        minimumLength: 8,
        requireLowercase: true,
        requireNumbers: false,
        requireUppercase: false,
        requireSymbols: false,
      },
    };

    this.identityPool = new cognito.CfnIdentityPool(
      this,
      'customerExclusionsCognitoIdp',
      {
        allowUnauthenticatedIdentities: false,
        cognitoIdentityProviders: [
          {
            clientId: userPoolClient.userPoolClientId,
            providerName: (this.userPool as cognito.UserPool)
              .userPoolProviderName,
          },
        ],
      },
    );

    this.policyStoreBucket = new AuthPolicyStore(this, 'AuthPolicyStore', {
      serviceName: SERVICE,
      organisationName: props.organisationName,
      policyDirectoryPath: path.resolve(__dirname, '../../../../authorisation')
    }).policyStoreBucket;

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: this.userPool.userPoolId,
    });
  }
}
