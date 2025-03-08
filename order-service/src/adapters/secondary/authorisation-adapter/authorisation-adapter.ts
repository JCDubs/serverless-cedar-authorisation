import { AuthorizationService, UnauthorizedError } from 'common-sdk';
import { authorizationConfig, authorizationServiceConfig } from '@config/config';
import { Order } from '@models/order';
import { createOrderEntity } from '@shared/auth-utils';
import { getLogger } from '@shared/monitor';
import { OrderAuthAction } from '../../../types';

const logger = getLogger({ serviceName: 'OrderAuthorisationService' });

/**
 * Determine whether a user is authorised to perform a specific action on an order resource.
 * @param action The action associated to the authorisation request.
 * @param order The Order to associate to the request.
 */
export const authoriseRequest = async (action: OrderAuthAction, order: Order): Promise<void> => {
    const authorizationService = await AuthorizationService.getService(authorizationConfig, authorizationServiceConfig)
    const authResult = authorizationService
        .setAction(action)
        .setResource(order.id)
        .setEntities([createOrderEntity(order)])
        .isAuthorized();

    logger.debug(`Order Authorisation result: `, { authResult });

    if (!authResult) {
        const message = `User is not authorised to perform the ${action} action on order with id ${order.id}`;
        logger.error(message, { authResult: authResult, order, });
        throw new UnauthorizedError(message);
    }
}