import { authorizationConfig } from './config';
import { OrderEntityProps } from './types';

export const createOrderEntity = (orderEntityProps: OrderEntityProps) => {
  return {
    uid: {
      type: `${authorizationConfig.namespace}${authorizationConfig.resourceType}`,
      id: orderEntityProps.id,
    },
    attrs: {
      createdBy: {
        __entity: {
          type: `${authorizationConfig.namespace}${authorizationConfig.principleType}`,
          id: orderEntityProps.createdBy,
        },
      },
      customer: {
        __entity: {
          type: `${authorizationConfig.namespace}${authorizationConfig.principleType}`,
          id: orderEntityProps.customer,
        },
      },
      accountManager: {
        __entity: {
          type: `${authorizationConfig.namespace}${authorizationConfig.principleType}`,
          id: orderEntityProps.accountManager,
        },
      },
      status: orderEntityProps.status,
    },
    parents: [],
  };
};
