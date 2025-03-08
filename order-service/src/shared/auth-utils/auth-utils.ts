import * as cedar from "@cedar-policy/cedar-wasm/nodejs";
import { authorizationConfig } from '@config/config';
import { Order } from "@models/order";

/**
 * Create a Cedar order entity.
 * @param Order 
 * @returns Order Cedar entity.
 */
export const createOrderEntity = (order: Order): cedar.EntityJson => {
    return {
        uid: {
            type: `${authorizationConfig.namespace}${authorizationConfig.resourceType}`,
            id: order.id,
        },
        attrs: {
            createdBy: {
                __entity: {
                    type: `${authorizationConfig.namespace}${authorizationConfig.principleType}`,
                    id: order.createdBy
                }
            },
            customer: {
                __entity: {
                    type: `${authorizationConfig.namespace}${authorizationConfig.principleType}`,
                    id: order.customer.email
                }
            },
            accountManager: {
                __entity: {
                    type: `${authorizationConfig.namespace}${authorizationConfig.principleType}`,
                    id: order.customer.accountManager
                }
            },
            status: order.status,
        },
        parents: []
    }
}