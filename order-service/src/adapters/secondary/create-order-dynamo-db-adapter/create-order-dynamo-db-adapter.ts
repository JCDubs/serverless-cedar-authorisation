import {TransactWriteItemsCommand} from '@aws-sdk/client-dynamodb';
import {Order} from '@models/order';
import {
  client,
  createPutTransactItem,
  createPutTransactItems,
} from '@shared/dynamo-db/utils';
import { getLogger } from '@shared/monitor';

const logger = getLogger({serviceName: 'createOrderDynamoDbAdapter'});

/**
 * Create order
 * @param order
 * @returns Order - Saved order
 */
export async function createOrderDynamoDbAdapter(order: Order): Promise<Order> {
  try {
    const items = [
      createPutTransactItem(order),
      ...createPutTransactItems(order.orderLines),
    ];
    logger.debug('Items are: ', {items});
    const transactWriteItemsCommand = new TransactWriteItemsCommand({
      TransactItems: items,
    });
    logger.debug('Transaction write is: ', {transactWriteItemsCommand});
    const response = await client.send(transactWriteItemsCommand);
    logger.debug('Response is: ', {response});
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
