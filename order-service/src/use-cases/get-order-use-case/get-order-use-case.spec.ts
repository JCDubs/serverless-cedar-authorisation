import {getOrderUseCase} from './get-order-use-case';
import {logger} from '@shared/index';
import {getOrderDynamoDbAdapter} from '@adapters/secondary/get-order-dynamo-db-adapter';
import {OrderModel} from '@models/order';
import {v4 as uuid} from 'uuid';
import {OrderDto} from '@dto/order-dto';

jest.mock('@shared/index', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock('@adapters/secondary/get-order-dynamo-db-adapter', () => ({
  getOrderDynamoDbAdapter: jest.fn(),
}));

describe('getOrderUseCase', () => {
  const mockId = uuid();
  const mockOrderDto = {
    id: mockId,
    name: 'test order name',
    description: 'test order description',
    totalPrice: 123,
    lines: [],
  };
  const order = OrderModel.fromDto(mockOrderDto as unknown as OrderDto);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve an order and log the operation', async () => {
    (getOrderDynamoDbAdapter as jest.Mock).mockResolvedValueOnce(order);

    const result = await getOrderUseCase(mockId);
    expect(getOrderDynamoDbAdapter).toHaveBeenCalledWith(mockId);
    expect(logger.debug).toHaveBeenCalledWith(
      `Retrieving order with id '${mockId}'`,
    );
    expect(logger.info).toHaveBeenCalledWith('Returning Order', {
      order,
    });
    expect(result).toEqual(order.toDto());
  });

  it('should handle errors and log them', async () => {
    const mockError = new Error('Test error');
    (getOrderDynamoDbAdapter as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(getOrderUseCase(mockId)).rejects.toThrow(mockError);
    expect(logger.debug).toHaveBeenCalledWith(
      `Retrieving order with id '${mockId}'`,
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Error occurred during order retrieval',
      {error: mockError},
    );
  });
});
