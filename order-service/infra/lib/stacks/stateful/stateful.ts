import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import * as dynamo from 'aws-cdk-lib/aws-dynamodb';

const gsiNames = ['GSI1', 'GSI2', 'GSI3', 'GSI4', 'GSI5'];

export class StatefulStack extends cdk.Stack {
  readonly orderTable: dynamo.Table;
  constructor(
    scope: Construct,
    id: string,
    readonly props: cdk.StackProps,
  ) {
    super(scope, id, props);

    this.orderTable = new dynamo.Table(this, 'OrderTable', {
      tableName: 'OrderTable',
      billingMode: dynamo.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      partitionKey: {
        name: 'PK',
        type: dynamo.AttributeType.STRING,
      },
      sortKey: {
        name: 'SK',
        type: dynamo.AttributeType.STRING,
      },
    });

    gsiNames.forEach(gsiName => {
      this.orderTable.addGlobalSecondaryIndex({
        indexName: gsiName,
        partitionKey: {
          name: `${gsiName}_PK`,
          type: dynamo.AttributeType.STRING,
        },
        sortKey: {
          name: `${gsiName}_SK`,
          type: dynamo.AttributeType.STRING,
        },
      });
    });
  }
}
