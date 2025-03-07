import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as njsLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import path from 'path';
import { config } from '@infra/config';
import { Config } from '@infra/types';

export interface OrdersStatelessStackProps extends cdk.StackProps, Config {
  orderTable: dynamo.Table;
  userPool: cognito.UserPool;
}

export class StatelessStack extends cdk.Stack {
  readonly orderAPI: apigw.LambdaRestApi;
  constructor(scope: Construct, id: string, props: OrdersStatelessStackProps) {
    super(scope, id, props);

    const createOrderLambda = this.createOrderAPILambda(
      'CreateOrderService',
      'api-create-order-adapter',
      props,
    );
    const updateOrderLambda = this.createOrderAPILambda(
      'UpdateOrderService',
      'api-update-order-adapter',
      props,
    );
    const deleteOrderLambda = this.createOrderAPILambda(
      'DeleteOrderService',
      'api-delete-order-adapter',
      props,
    );
    const getOrderLambda = this.createOrderAPILambda(
      'GetOrderService',
      'api-get-order-adapter',
      props,
    );
    const listOrderLambda = this.createOrderAPILambda(
      'ListOrderService',
      'api-list-order-adapter',
      props,
    );

    props.orderTable.grantReadWriteData(createOrderLambda);
    props.orderTable.grantReadWriteData(updateOrderLambda);
    props.orderTable.grantReadWriteData(deleteOrderLambda);
    props.orderTable.grantReadData(getOrderLambda);
    props.orderTable.grantReadData(listOrderLambda);

    this.orderAPI = new apigw.LambdaRestApi(this, 'OrderAPI', {
      handler: getOrderLambda,
      proxy: false,
    });

    const authorizer = new apigw.CognitoUserPoolsAuthorizer(this, 'UserPoolAuthoriser', {
      cognitoUserPools: [props.userPool],
      authorizerName: 'UserPool-order-authoriser',
      identitySource: 'method.request.header.Authorization',
    });

    const orderResource = this.orderAPI.root.addResource('orders');
    const orderIdResource = orderResource.addResource('{id}');
    // /orders
    orderResource.addMethod(
      'POST',
      new apigw.LambdaIntegration(createOrderLambda), 
      { authorizer });
    orderResource.addMethod(
      'GET',
      new apigw.LambdaIntegration(listOrderLambda),
      { authorizer });
    // /orders/{orderId}
    orderIdResource.addMethod(
      'PUT',
      new apigw.LambdaIntegration(updateOrderLambda),
      { authorizer });
    orderIdResource.addMethod(
      'DELETE',
      new apigw.LambdaIntegration(deleteOrderLambda),
      { authorizer });
    // /orders/{orderId}
    orderIdResource.addMethod(
      'GET',
      new apigw.LambdaIntegration(getOrderLambda),
      { authorizer });
  }

  createOrderAPILambda(
    serviceName: string,
    entryFileName: string,
    props: OrdersStatelessStackProps,
    environmentVariables?: Record<string, string>,
  ) {
    return new njsLambda.NodejsFunction(this, serviceName, {
      functionName: serviceName,
      entry: path.resolve(
        __dirname,
        `../../../../src/adapters/primary/${entryFileName}/${entryFileName}.ts`,
      ),
      memorySize: 1024,
      runtime: lambda.Runtime.NODEJS_20_X,
      environment: {
        LOG_LEVEL: 'DEBUG',
        POWERTOOLS_LOG_LEVEL: 'DEBUG',
        TABLE_NAME: props.orderTable.tableName,
        COUNTRY: config.country,
        DOMAIN: config.domain,
        SERVICE_NAME: config.service,
        ENVIRONMENT: props.environment,
        POWERTOOLS_SERVICE_NAME: serviceName,
        ...environmentVariables,
      },
      bundling: {
        minify: true,
        externalModules: ['@aws-sdk/*', '@cedar-policy/cedar-wasm/nodejs'],
      },
    });
  }
}
