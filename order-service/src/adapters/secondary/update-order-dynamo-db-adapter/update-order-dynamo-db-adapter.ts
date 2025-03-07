import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';
import { getLogger } from '@shared/monitor';
import { Order, OrderLine } from '@models/order';
import {
  client,
  createDeleteTransactItems,
  createPutTransactItem,
  createPutTransactItems,
} from '@shared/dynamo-db/utils';

const logger = getLogger({ serviceName: 'updateOrderDynamoDbAdapter' });

/**
 * Update order
 * @param orderModel
 * @returns OrderModel - Saved order
 */
export async function updateOrderDynamoDbAdapter(
  order: Order,
  orderLinesToDelete: OrderLine[],
): Promise<Order> {
  try {
    const items = [
      createPutTransactItem(order),
      ...createPutTransactItems(order.orderLines!),
      ...createDeleteTransactItems(orderLinesToDelete),
    ];
    logger.debug('Items are: ', { items });
    const transactWriteItemsCommand = new TransactWriteItemsCommand({
      TransactItems: items,
    });
    logger.debug('Transaction write is: ', { transactWriteItemsCommand });
    const response = await client.send(transactWriteItemsCommand);
    logger.debug('Response is: ', { response });
    if (!response || response.$metadata.httpStatusCode !== 200) {
      throw Error('Could not update the order.');
    }
    return order;
  } catch (err) {
    const error = err as Error;
    logger.error(`Could not save Order: ${error.message}`, error);
    throw error;
  }
}
