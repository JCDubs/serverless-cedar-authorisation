import {deleteOrderDynamoDbAdapter} from './delete-order-dynamo-db-adapter';
import {dynamoDBService} from '@shared/dynamo-db';
import {logger} from '@shared/index';
import {config} from '@config/config';
import {v4 as uuid} from 'uuid';

jest.mock('@shared/index');
jest.mock('@shared/dynamo-db');
jest.mock('@config/config');

describe('deleteOrderDynamoDbAdapter', () => {
  const mockId = uuid();
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete order successfully', async () => {
    const mockConfig = {get: jest.fn().mockReturnValue('OrdersTable')};

    const {deleteItem} = dynamoDBService;
    (deleteItem as jest.Mock).mockResolvedValueOnce({});

    config.get = mockConfig.get;

    await deleteOrderDynamoDbAdapter(mockId);

    expect(deleteItem).toBeCalledWith({
      TableName: 'OrdersTable',
      Key: {
        PK: {
          S: `ORDER#${mockId}`,
        },
      },
    });
  });

  it('should throw an error when deletion fails', async () => {
    const mockError = new Error('DynamoDB error');

    (dynamoDBService.deleteItem as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(deleteOrderDynamoDbAdapter(mockId)).rejects.toThrow(mockError);

    const {error} = logger;
    expect(error).toBeCalledWith(
      `Could not delete Order: ${mockError.message}`,
      mockError,
    );
  });
});
