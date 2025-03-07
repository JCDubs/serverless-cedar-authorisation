#!/usr/bin/env node
import * as dotenv from 'dotenv';
import * as cdk from 'aws-cdk-lib';
import { CedarLambdaLayerStack } from '../lib/cedar-lambda-layer-stack';
import { CentralPolicyStoreStack } from '../lib/central-policy-store-stack';
// Load environment variables from .env file
dotenv.config();

if (!process.env.ORGANISATION_ID || !process.env.ORGANISATION_NAME) {
  throw new Error('ORGANISATION_ID or ORGANISATION_NAME is not set');
}

const app = new cdk.App();
new CedarLambdaLayerStack(app, 'CedarLambdaLayerStack', {
  organisationId: process.env.ORGANISATION_ID,
});
new CentralPolicyStoreStack(app, 'CentralPolicyStoreStack', {
  organisationId: process.env.ORGANISATION_ID,
  organisationName: process.env.ORGANISATION_NAME,
});
