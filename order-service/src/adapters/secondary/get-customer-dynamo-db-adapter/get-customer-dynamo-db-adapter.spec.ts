import {getCustomerDynamoDbAdapter} from './get-customer-dynamo-db-adapter';
import {dynamoDBService} from '@shared/dynamo-db';
import {putMetric, metrics} from '@shared/index';
import {config} from '@config/config';
import {ResourceNotFoundError} from '@errors/index';
import {v4 as uuid} from 'uuid';
import {marshall} from '@aws-sdk/util-dynamodb';

jest.mock('@shared/index');
jest.mock('@shared/dynamo-db');
jest.mock('@config/config');

describe('getCustomerDynamoDbAdapter', () => {
  const mockId = uuid();
  const customer = {
    id: mockId,
    name: 'New Customer',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const mockItem = marshall(
    {
      PK: `CUSTOMER:#${mockId}`,
      ...customer,
    },
    {
      convertClassInstanceToMap: true,
      removeUndefinedValues: true,
    },
  );
  const mockInvalidItem = marshall(
    {
      PK: `CUSTOMER:#${mockId}`,
      ...customer,
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

  it('should retrieve an customer successfully', async () => {
    const mockConfig = {get: jest.fn().mockReturnValue('CustomersTable')};

    const {getItem} = dynamoDBService;
    (getItem as jest.Mock).mockResolvedValueOnce(mockItem);

    config.get = mockConfig.get;

    const customer = await getCustomerDynamoDbAdapter(mockId);

    expect(getItem).toBeCalledWith({
      TableName: 'CustomersTable',
      Key: {
        PK: {
          S: `CUSTOMER#${mockId}`,
        },
      },
    });
    expect(customer).toBeDefined();
  });

  it('should throw ResourceNotFoundError when customer does not exist', async () => {
    (dynamoDBService.getItem as jest.Mock).mockResolvedValueOnce(null);

    await expect(getCustomerDynamoDbAdapter(mockId)).rejects.toThrow(
      ResourceNotFoundError,
    );
  });

  it('should throw ValidationError when customer fails validation', async () => {
    (dynamoDBService.getItem as jest.Mock).mockResolvedValueOnce(
      mockInvalidItem,
    );

    await expect(getCustomerDynamoDbAdapter(mockId)).rejects.toThrow(
      new Error('Customer is invalid'),
    );
    expect(putMetric).toBeCalledWith({
      metrics,
      metricName: 'InvalidCustomer',
    });
  });
});
