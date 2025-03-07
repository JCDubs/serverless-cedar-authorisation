import {TransactWriteItemsCommand} from '@aws-sdk/client-dynamodb';
import {Order} from '@models/order';
import { getLogger } from '@shared/monitor';
import {
  client,
  createDeleteTransactItem,
  createDeleteTransactItems,
} from '@shared/dynamo-db/utils';

const logger = getLogger({serviceName: 'deleteOrderDynamoDbAdapter'});

/**
 * Delete order
 * @param id
 */
export async function deleteOrderDynamoDbAdapter(order: Order): Promise<void> {
  try {
    const items = [
      createDeleteTransactItem(order),
      ...createDeleteTransactItems(order.orderLines),
    ];
    logger.debug('Items are: ', {items});
    const transactWriteItemsCommand = new TransactWriteItemsCommand({
      TransactItems: items,
    });
    logger.debug('Transaction write is: ', {transactWriteItemsCommand});
    const response = await client.send(transactWriteItemsCommand);
    logger.debug('Response is: ', {response});
    if (!response || response.$metadata.httpStatusCode !== 200) {
      throw Error('Could not delete the order.');
    }
  } catch (err) {
    const error = err as Error;
    logger.error(`Could not delete Order: ${error.message}`, error);
    throw error;
  }
}
