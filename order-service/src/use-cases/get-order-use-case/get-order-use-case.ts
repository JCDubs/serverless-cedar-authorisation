import {getLogger} from '@shared/index';
import {Order} from '@models/order';
import {OrderDTO} from '@dto/order-dto';
import {getOrderByIdDynamoDbAdapter} from '@adapters/secondary/get-order-dynamo-db-adapter';

const logger = getLogger({serviceName: 'getOrderUseCase'})

/**
 * Get Order use case.
 * @param id
 * @returns OrderDto
 */
export async function getOrderUseCase(id: string): Promise<OrderDTO> {
  try {
    logger.debug(`Retrieving order with id '${id}'`);
    const order: Order = await getOrderByIdDynamoDbAdapter(id);
    logger.info('Returning Order', {order});
    return order.toDTO();
  } catch (err) {
    const error = err as Error;
    logger.error('Error occurred during order retrieval', {error});
    throw error;
  }
}
