import {getOrderDynamoDbAdapter} from './get-order-dynamo-db-adapter';
import {dynamoDBService} from '@shared/dynamo-db';
import {putMetric, metrics} from '@shared/index';
import {config} from '@config/config';
import {ResourceNotFoundError} from '@errors/index';
import {v4 as uuid} from 'uuid';
import {marshall} from '@aws-sdk/util-dynamodb';

jest.mock('@shared/index');
jest.mock('@shared/dynamo-db');
jest.mock('@config/config');

describe('getOrderDynamoDbAdapter', () => {
  const mockId = uuid();
  const order = {
    id: mockId,
    name: 'New Order',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const mockItem = marshall(
    {
      PK: `ORDER:#${mockId}`,
      ...order,
    },
    {
      convertClassInstanceToMap: true,
      removeUndefinedValues: true,
    },
  );
  const mockInvalidItem = marshall(
    {
      PK: `ORDER:#${mockId}`,
      ...order,
      id: null,
    },
    {
      convertClassInstanceToMap: true,
      removeUndefinedValues: true,
    },
  );

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should retrieve an order successfully', async () => {
    const mockConfig = {get: jest.fn().mockReturnValue('OrdersTable')};

    const {getItem} = dynamoDBService;
    (getItem as jest.Mock).mockResolvedValueOnce(mockItem);

    config.get = mockConfig.get;

    const order = await getOrderDynamoDbAdapter(mockId);

    expect(getItem).toBeCalledWith({
      TableName: 'OrdersTable',
      Key: {
        PK: {
          S: `ORDER#${mockId}`,
        },
      },
    });
    expect(order).toBeDefined();
  });

  it('should throw ResourceNotFoundError when order does not exist', async () => {
    (dynamoDBService.getItem as jest.Mock).mockResolvedValueOnce(null);

    await expect(getOrderDynamoDbAdapter(mockId)).rejects.toThrow(
      ResourceNotFoundError,
    );
  });

  it('should throw ValidationError when order fails validation', async () => {
    (dynamoDBService.getItem as jest.Mock).mockResolvedValueOnce(
      mockInvalidItem,
    );

    await expect(getOrderDynamoDbAdapter(mockId)).rejects.toThrow(
      new Error('Order is invalid'),
    );
    expect(putMetric).toBeCalledWith({
      metrics,
      metricName: 'InvalidOrder',
    });
  });
});
