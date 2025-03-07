import {putMetric, metrics, getLogger} from '@shared/index';
import {deleteOrderDynamoDbAdapter} from '@adapters/secondary/delete-order-dynamo-db-adapter';
import {getOrderByIdDynamoDbAdapter} from '@adapters/secondary/get-order-dynamo-db-adapter';

const logger = getLogger({serviceName: 'deleteOrderUseCase'});

/**
 * Delete Order
 * @param id
 */
export async function deleteOrderUseCase(id: string): Promise<void> {
  try {
    const order = await getOrderByIdDynamoDbAdapter(id);
    await order.validate();
    await deleteOrderDynamoDbAdapter(order);
    logger.info('Deleted Order with id', {id});

    putMetric({
      metrics,
      metricName: 'OrderDeleted',
    });
  } catch (err) {
    const error = err as Error;
    logger.error('Error deleting Order', {error});
    throw error;
  }
}
