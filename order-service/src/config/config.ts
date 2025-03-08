import { Country, Domain } from '@infra/types';
import convict from 'convict';
import { AuthorizationConfigType, ServiceConfig } from 'common-sdk';

export const config = convict({
  tableName: {
    doc: 'The name of the database table',
    format: String,
    default: 'tableName',
    env: 'TABLE_NAME',
  },
  serviceName: {
    doc: 'The name of the service',
    format: String,
    default: 'serviceName',
    env: 'SERVICE_NAME',
  },
  businessDomain: {
    doc: 'The name of the AWS Layer',
    format: String,
    default: Domain.ORDER,
  },
  country: {
    doc: 'The country the service is deployed to',
    format: String,
    default: Country.GB,
    env: 'COUNTRY',
  },
  domain: {
    doc: 'The domain the service is deployed to',
    format: String,
    default: Domain.ORDER,
    env: 'DOMAIN',
  },
  env: {
    doc: 'The environment the service is deployed to',
    format: String,
    default: 'undefined',
    env: 'ENVIRONMENT',
  },
  organisationName: {
    doc: 'The name of the organisation',
    format: String,
    default: 'undefined',
    env: 'ORGANISATION_NAME',
  },
}).validate({allowed: 'strict'});

export const authorizationServiceConfig: ServiceConfig = {
  serviceName: config.get('serviceName'),
  organisationName: config.get('organisationName'),
}

export const authorizationConfig: AuthorizationConfigType = {
  namespace: 'OrderService::',
  principleType: 'User',
  resourceType: 'Order',
  roleType: 'Role',
};
