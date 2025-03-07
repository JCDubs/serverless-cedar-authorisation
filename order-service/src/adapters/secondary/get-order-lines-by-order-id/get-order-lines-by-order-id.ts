import { DynamoDBClient, QueryCommand } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { config } from '@config/config';
import { OrderLine } from '@models/order';
import { getLogger } from '@shared/monitor';
import { DynamoOrderLineDTO } from '@dto/dynamo-order-dto';

const client = new DynamoDBClient();
const logger = getLogger({ serviceName: 'getOrderLinesByOrderId' });

export const getOrderLinesByOrderId = async (
  orderId: string,
): Promise<OrderLine[]> => {
  const params = {
    TableName: config.get('tableName'),
    KeyConditionExpression: 'PK = :partitionKeyValue AND begins_with(SK, :sortKeyPrefix)',
    ExpressionAttributeValues: marshall({
      ':partitionKeyValue': 'ORDER_LINE',
      ':sortKeyPrefix': `ORDER_ID#${orderId}`,
    }),
  };

  logger.debug('The params is: ', { params });
  const response = await client.send(new QueryCommand(params));
  logger.debug('Response is: ', { response });
  const orderLines: OrderLine[] = response.Items?.map(item =>
    OrderLine.fromDatabaseDTO(unmarshall(item) as DynamoOrderLineDTO),
  ) ?? [];
  logger.debug('orderLines is: ', { orderLines });
  return orderLines;
};
