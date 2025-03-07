import { Config } from '@infra/types';
import * as cdk from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {SubnetType, Vpc} from 'aws-cdk-lib/aws-ec2';
import {Construct} from 'constructs';

export const testData: [
  environment: string,
  stage: string,
  account: string,
][] = [
  ['TEST', 'test', 'test'],
];

export const createConfig = (
  environment: string,
  stage: string,
  account: string,
): cdk.StackProps & Config => {
  const config = {
    stage,
    environment,
    projectName: 'quotation-ingress',
    region: 'eu-west-1',
    account,
    domain: 'ORDER',
  };
  return {
    ...config,
    service: 'order-service',
    serviceCode: 'odr',
    env: {account: environment, region: 'eu-west-1'},
    country: 'gb',
  };
};

export const processTemplate = (template: Template) => {
  return JSON.parse(
    JSON.stringify(template, null, 4).replace(
      /"S3Key":\s".+?\..+?"/gi,
      '"S3Key": "Any<String>"',
    ),
  );
};

export const createVPC = (construct: Construct) => {
  return new Vpc(construct, 'mocked-vpc', {
    cidr: '10.0.0.0/16',
    maxAzs: 2,
    subnetConfiguration: [
      {
        cidrMask: 24,
        name: 'egress',
        subnetType: SubnetType.PUBLIC,
      },
      {
        cidrMask: 24,
        name: 'application',
        subnetType: SubnetType.PRIVATE_WITH_EGRESS,
      },
      {
        cidrMask: 28,
        name: 'rds',
        subnetType: SubnetType.PRIVATE_ISOLATED,
      },
    ],
  });
};
