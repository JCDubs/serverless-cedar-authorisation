import { AuthorizationConfigType, ServiceConfig } from '../types';

export const authorizationConfig: AuthorizationConfigType = {
  namespace: 'OrderService::',
  principleType: 'User',
  resourceType: 'Order',
  roleType: 'Role',
};
export const serviceConfig: ServiceConfig = {
  serviceName: 'Test-Service',
  organisationName: 'Test-Organisation',
};
