import {listOrderDynamoDbAdapter} from './list-order-dynamo-db-adapter';
import {marshall} from '@aws-sdk/util-dynamodb';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {OrderModel} from '@models/order';
import {v4 as uuid} from 'uuid';

jest.mock('@aws-sdk/client-dynamodb');

describe('listOrderDynamoDbAdapter tests', () => {
  const mockOrder: OrderModel = OrderModel.fromDto({
    id: uuid(),
    // Other required properties
    name: 'Listed Order',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of orders', async () => {
    const mockedScan = jest.fn().mockResolvedValueOnce({
      Items: [
        marshall(
          {PK: `ORDER#${mockOrder.id}`, ...mockOrder},
          {
            convertClassInstanceToMap: true,
            removeUndefinedValues: true,
          },
        ),
      ],
    });

    (DynamoDBClient.prototype.send as jest.Mock) = mockedScan;

    const result = await listOrderDynamoDbAdapter({limit: 10});
    expect(result.items).toEqual([mockOrder]);
  });

  it('should calculate the offset correctly', async () => {
    const mockedScan = jest.fn().mockResolvedValueOnce({
      Items: [
        marshall(mockOrder, {
          convertClassInstanceToMap: true,
          removeUndefinedValues: true,
        }),
      ],
      LastEvaluatedKey: marshall({PK: 'ORDER#124'}),
    });

    (DynamoDBClient.prototype.send as jest.Mock) = mockedScan;

    const result = await listOrderDynamoDbAdapter({limit: 10});
    expect(result.offset).toEqual('124');
  });

  it('should filter out invalid orders', async () => {
    const invalidOrder = {};

    const mockedScan = jest.fn().mockResolvedValueOnce({
      Items: [
        marshall(mockOrder, {
          convertClassInstanceToMap: true,
          removeUndefinedValues: true,
        }),
        marshall(invalidOrder, {
          convertClassInstanceToMap: true,
          removeUndefinedValues: true,
        }),
      ],
    });

    (DynamoDBClient.prototype.send as jest.Mock) = mockedScan;

    const result = await listOrderDynamoDbAdapter({limit: 10});
    expect(result.items).toEqual([mockOrder]);
  });

  it('should throw an error if the scan fails', async () => {
    const mockedScan = jest
      .fn()
      .mockRejectedValueOnce(new Error('Scan failed'));

    (DynamoDBClient.prototype.send as jest.Mock) = mockedScan;

    await expect(listOrderDynamoDbAdapter({limit: 10})).rejects.toThrow(
      'Scan failed',
    );
  });
});
