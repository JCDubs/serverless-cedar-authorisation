import { GetItemCommandInput } from '@aws-sdk/client-dynamodb';
import { marshall, unmarshall } from '@aws-sdk/util-dynamodb';
import { config } from '@config/config';
import { dynamoDBService } from '@shared/dynamo-db';
import { Customer } from '@models/customer';
import { ResourceNotFoundError } from '@errors/resource-not-found';
import { DynamoCustomerDTO } from '@dto/dynamo-customer-dto';
import { getLogger } from '@shared/monitor';

const logger = getLogger({ serviceName: 'getCustomerByIDDynamoDbAdapter' });

/**
 * Get customer
 * @param customerModel
 * @returns CustomerModel - Retrieved customer
 */
export async function getCustomerByIDDynamoDbAdapter(
  id: string,
): Promise<Customer> {
  try {
    logger.debug('Getting Customer for id.', { id });
    const params: GetItemCommandInput = {
      TableName: config.get('tableName'),
      Key: marshall({ PK: 'CUSTOMER', SK: id }),
    };
    const item = await dynamoDBService.getItem(params);

    if (!item) {
      throw new ResourceNotFoundError(`Customer with id "${id} not found"`);
    }

    const unmarshalledItem = unmarshall(item);
    logger.debug('Customer retrieved', { unmarshalledItem });
    const customer = Customer.fromDatabaseDTO(
      unmarshalledItem as DynamoCustomerDTO,
    );
    await customer.validate();
    return customer;
  } catch (err) {
    const error = err as Error;
    logger.error(`Could not retrieve Customer: ${error.message}`, error);
    throw error;
  }
}
