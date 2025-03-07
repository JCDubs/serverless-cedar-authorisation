import { DynamoDBClient, QueryCommand, QueryCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import {
  ListItems,
  PaginationParams,
} from '@shared/index';
import { config } from '@config/config';
import { Order } from '@models/order';
import { DynamoOrderDTO } from '@dto/dynamo-order-dto';
import { getLogger } from '@shared/monitor';

const client = new DynamoDBClient();
const logger = getLogger({serviceName: 'getOrderLinesByOrderId'});
const defaultLimit = 10;

/**
 * List Order
 * @param paginationParams
 * @returns Promise<ListItems<OrderModel, string>> - Retrieved Order List
 */
export async function listOrderDynamoDbAdapter(
  paginationParams: PaginationParams,
): Promise<ListItems<Order, string>> {
  try {
    logger.debug('Listing Order.', { paginationParams });

    const params: QueryCommandInput = {
      TableName: config.get('tableName'),
      KeyConditionExpression: 'PK = :partitionKeyValue',
      ExpressionAttributeValues: marshall({
        ':partitionKeyValue': 'ORDER',
      }),
      Limit: paginationParams.limit ?? defaultLimit,
    };

    if (paginationParams.offset) {
      params.ExclusiveStartKey = marshall({
        PK: 'ORDER',
        SK: paginationParams.offset
      });
    }
    logger.debug('Listing Order with params: ', { params });
    const response = await client.send(new QueryCommand(params));
    const items = response.Items ? response.Items : [];
    logger.info('Retrieved order items.', { items });
    const validOrders: Order[] = [];

    for (const item of items) {
      const unmarshalledItem = unmarshall(item) as DynamoOrderDTO;
      const order = Order.fromDatabaseDTO(unmarshalledItem);
      await order.validate();
      validOrders.push(order);
    }

    let offset = undefined;
    if (response.LastEvaluatedKey) {
      offset = unmarshall(response.LastEvaluatedKey) as {
        PK: string;
        SK: string;
      };
      offset = offset.SK;
    }

    return {
      items: validOrders,
      offset,
    };
  } catch (err) {
    const error = err as Error;
    logger.error(`Could not retrieve list of Order: ${error.message}`, error);
    throw error;
  }
}
