import {createOrderDynamoDbAdapter} from './create-order-dynamo-db-adapter';
import {dynamoDBService} from '@shared/dynamo-db';
import {logger} from '@shared/index';
import {config} from '@config/config';
import {OrderModel} from '@models/order';
import {v4 as uuid} from 'uuid';

// Mocking external dependencies
jest.mock('@shared/index');
jest.mock('@shared/dynamo-db');
jest.mock('@config/config');
jest.mock('@aws-sdk/util-dynamodb');

describe('createOrderDynamoDbAdapter', () => {
  const mockId = uuid();
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create order successfully', async () => {
    const mockOrder: OrderModel = OrderModel.fromDto({
      id: mockId,
      name: 'New Order',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Other properties
    });
    const mockConfig = {get: jest.fn().mockReturnValue('OrdersTable')};

    const {createItem} = dynamoDBService;
    (createItem as jest.Mock).mockResolvedValueOnce({});

    config.get = mockConfig.get;

    const result = await createOrderDynamoDbAdapter(mockOrder);

    expect(result).toEqual(mockOrder);
    expect(createItem).toBeCalledWith({
      TableName: 'OrdersTable',
      Item: expect.objectContaining({
        PK: {
          S: `ORDER#${mockId}`,
        },
        // ... other expected marshall outputs
      }),
    });
  });

  it('should throw an error when saving fails', async () => {
    const mockOrder: OrderModel = OrderModel.fromDto({
      id: mockId,
      name: 'New Order',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      // Other properties
    });

    const mockError = new Error('DynamoDB error');
    (dynamoDBService.createItem as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(createOrderDynamoDbAdapter(mockOrder)).rejects.toThrow(
      mockError,
    );

    const {error} = logger;
    expect(error).toBeCalledWith(
      `Could not save Order: ${mockError.message}`,
      mockError,
    );
  });
});
