import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {config} from '@config/config';
import {DynamoDBItem, DynamoDBRecord} from '../../types';
import {marshall} from '@aws-sdk/util-dynamodb';

export const client = new DynamoDBClient();
const tableName = config.get('tableName');
const marshallProps = {
  convertClassInstanceToMap: true,
  removeUndefinedValues: true,
};

export const createPutTransactItem = <
  T extends DynamoDBRecord<U>,
  U extends DynamoDBItem,
>(
  item: T,
) => {
  return {
    Put: {
      Item: marshall(item.toDatabaseDTO(), marshallProps),
      TableName: tableName,
    },
  };
};

export const createPutTransactItems = <
  T extends DynamoDBRecord<U>,
  U extends DynamoDBItem,
>(
  item: T[],
) => {
  return item.map(item => createPutTransactItem(item));
};

export const createDeleteTransactItem = <
  T extends DynamoDBRecord<U>,
  U extends DynamoDBItem,
>(
  item: T,
) => {
  const dynamoDBItem = item.toDatabaseDTO();
  return {
    Delete: {
      Key: marshall({
        PK: dynamoDBItem.PK,
        SK: dynamoDBItem.SK,
      }),
      TableName: tableName,
    },
  };
};

export const createDeleteTransactItems = <
  T extends DynamoDBRecord<U>,
  U extends DynamoDBItem,
>(
  item: T[],
) => {
  return item.map(item => createDeleteTransactItem(item));
};
