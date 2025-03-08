import {Config, Country, Domain, Environment} from '@infra/types';
import {
  MISSING_ACCOUNT_VARIABLE_ERROR,
  MISSING_CEDAR_LAMBDA_LAYER_ARN_ERROR,
  MISSING_COUNTRY_VARIABLE_ERROR,
  MISSING_ENVIRONMENT_VARIABLE_ERROR,
  MISSING_ORGANISATION_NAME_ERROR,
  MISSING_REGION_VARIABLE_ERROR,
} from '@infra/constants/errors';
import {DOMAIN, SERVICE, SERVICE_CODE} from '@infra/constants/props';

if (!process.env.COUNTRY) {
  throw Error(MISSING_COUNTRY_VARIABLE_ERROR);
}

if (!process.env.ENVIRONMENT) {
  throw Error(MISSING_ENVIRONMENT_VARIABLE_ERROR);
}

if (!process.env.ACCOUNT) {
  throw Error(MISSING_ACCOUNT_VARIABLE_ERROR);
}

if (!process.env.REGION) {
  throw Error(MISSING_REGION_VARIABLE_ERROR);
}

if (!process.env.ORGANISATION_NAME) {
  throw Error(MISSING_ORGANISATION_NAME_ERROR);
}

if (!process.env.CEDAR_LAMBDA_LAYER_ARN) {
  throw Error(MISSING_CEDAR_LAMBDA_LAYER_ARN_ERROR);
}

export const config: Config = {
  country: process.env.COUNTRY as Country,
  stage: process.env.STAGE || process.env.ENVIRONMENT,
  environment: process.env.ENVIRONMENT as Environment,
  service: SERVICE,
  serviceCode: SERVICE_CODE,
  account: process.env.ACCOUNT,
  domain: DOMAIN as Domain,
  region: process.env.REGION,
  organisationName: process.env.ORGANISATION_NAME,
  cedarLambdaLayerARN: process.env.CEDAR_LAMBDA_LAYER_ARN,
};
