import {GetItemCommandInput} from '@aws-sdk/client-dynamodb';
import {marshall, unmarshall} from '@aws-sdk/util-dynamodb';
import {config} from '@config/config';
import {dynamoDBService} from '@shared/dynamo-db';
import { getLogger } from '@shared/monitor';
import {Order} from '@models/order';
import {ResourceNotFoundError} from '@errors/resource-not-found';
import {DynamoOrderDTO} from '@dto/dynamo-order-dto';
import { getOrderLinesByOrderId } from '../get-order-lines-by-order-id';

const logger = getLogger({serviceName: 'getOrderDynamoDbAdapter'});

/**
 * Get order
 * @param order
 * @returns Order - Retrieved order
 */
export async function getOrderByIdDynamoDbAdapter(id: string): Promise<Order> {
  try {
    logger.debug('Getting Order for id.', {id});

    const params: GetItemCommandInput = {
      TableName: config.get('tableName'),
      Key: marshall({PK: 'ORDER', SK: id}),
    };
    const item = await dynamoDBService.getItem(params);

    if (!item) {
      throw new ResourceNotFoundError(`Order with id "${id} not found"`);
    }

    const unmarshalledItem = unmarshall(item);
    logger.debug('Order retrieved', {unmarshalledItem});
    const orderLines = await getOrderLinesByOrderId(id);
    logger.debug('Order lines.', {orderLines: orderLines});
    const order = Order.fromDatabaseDTO(unmarshalledItem as DynamoOrderDTO);
    order.addOrderLines(orderLines);
    logger.debug('Retrieved order.', {order: order.toDTO()});
    await order.validate();
    return order;
  } catch (err) {
    const error = err as Error;
    logger.error(`Could not retrieve Order: ${error.message}`, error);
    throw error;
  }
}
