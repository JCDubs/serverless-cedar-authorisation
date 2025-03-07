import {listOrderUseCase} from './list-order-use-case';
import {logger} from '@shared/index';
import {listOrderDynamoDbAdapter} from '@adapters/secondary/list-order-dynamo-db-adapter';
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

jest.mock('@adapters/secondary/list-order-dynamo-db-adapter', () => ({
  listOrderDynamoDbAdapter: jest.fn(),
}));

describe('listOrderUseCase tests', () => {
  const mockId = uuid();
  const mockOrderDto = {
    id: mockId,
    name: 'test order name',
    description: 'test order description',
    totalPrice: 123,
    lines: [],
  };
  const orderOne = OrderModel.fromDto(mockOrderDto as unknown as OrderDto);
  const orderTwo = OrderModel.fromDto(mockOrderDto as unknown as OrderDto);
  const mockPaginationParams = {limit: 5, offset: 'someOffset'};
  const mockOrderModelList = [orderOne, orderTwo];
  const mockOrderDtoList = mockOrderModelList.map(order => order.toDto());

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully retrieve a list of orders, map them to DTOs and log the operation', async () => {
    (listOrderDynamoDbAdapter as jest.Mock).mockResolvedValueOnce({
      items: mockOrderModelList,
      offset: 'newOffset',
    });

    const result = await listOrderUseCase(mockPaginationParams);

    expect(listOrderDynamoDbAdapter).toHaveBeenCalledWith(mockPaginationParams);
    expect(logger.debug).toHaveBeenCalledWith(
      "Retrieving list of order'",
      mockPaginationParams,
    );
    expect(logger.info).toHaveBeenCalledWith('Returning Order list', {
      orderList: {items: mockOrderModelList, offset: 'newOffset'},
    });
    expect(result).toEqual({
      items: mockOrderDtoList,
      offset: 'newOffset',
    });
  });

  it('should handle errors and log them', async () => {
    const mockError = new Error('Test error');
    (listOrderDynamoDbAdapter as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(listOrderUseCase(mockPaginationParams)).rejects.toThrow(
      mockError,
    );
    expect(logger.debug).toHaveBeenCalledWith(
      "Retrieving list of order'",
      mockPaginationParams,
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Error occurred during order retrieval',
      {error: mockError},
    );
  });
});
