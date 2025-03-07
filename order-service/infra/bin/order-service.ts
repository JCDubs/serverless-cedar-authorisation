import * as cdk from 'aws-cdk-lib';
import {config} from '@infra/config';
import {AuthStack} from '@infra/lib/stacks/auth';
import {StatefulStack} from '@infra/lib/stacks/stateful';
import {StatelessStack} from '@infra/lib/stacks/stateless';
import {AUTH, STATEFUL, STATELESS} from '@infra/constants/props';
import {Tags} from 'aws-cdk-lib';
import { Config } from '@infra/types';

const stackProps: cdk.StackProps & Config = {
  ...config,
  env: {account: process.env.CDK_DEFAULT_ACCOUNT, region: config.region},
};

const app = new cdk.App();

Tags.of(app).add('service', config.service);
Tags.of(app).add('serviceCode', config.serviceCode);
Tags.of(app).add('environment', config.environment);
Tags.of(app).add('availability', '24-7');
Tags.of(app).add('deploymentMethod', 'CDK');
Tags.of(app).add('region', config.region);
Tags.of(app).add('businessRisk', 'MEDIUM');
Tags.of(app).add('owner', 'cloudEngineering');

const authStack = new AuthStack(
  app,
  `OrderService-${config.stage}-${AUTH}`,
  stackProps,
);
const statefulStack = new StatefulStack(
  app,
  `OrderService-${config.stage}-${STATEFUL}`,
  stackProps,
);
new StatelessStack(app, `OrderService-${config.stage}-${STATELESS}`, {
  ...stackProps,
  orderTable: statefulStack.orderTable,
  userPool: authStack.userPool,
});
