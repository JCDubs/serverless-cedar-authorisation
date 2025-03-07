import {updateOrderUseCase} from './update-order-use-case';
import {logger, putMetric, metrics, validate} from '@shared/index';
import {updateOrderDynamoDbAdapter} from '@adapters/secondary/update-order-dynamo-db-adapter';
import {ValidationError} from '@errors/index';
import {OrderModel} from '@models/order';
import {OrderDto} from '@dto/order-dto';

jest.mock('@shared/index', () => ({
  logger: {
    debug: jest.fn(),
    error: jest.fn(),
  },
  putMetric: jest.fn(),
  validate: jest.fn(),
  metrics: {},
}));

jest.mock('@adapters/secondary/update-order-dynamo-db-adapter', () => ({
  updateOrderDynamoDbAdapter: jest.fn(),
}));

describe('updateOrderUseCase tests', () => {
  const mockId = 'mockId';
  const mockUpdateOrderDto: OrderDto = {
    id: mockId,
    name: 'test order name',
    createdAt: new Date().toUTCString(),
    updatedAt: new Date().toUTCString(),
  };
  const mockOrderModel = OrderModel.fromDto(mockUpdateOrderDto);

  beforeEach(() => {
    jest.clearAllMocks();
    (validate as jest.Mock).mockResolvedValue({isValid: true});
  });

  it('should successfully update an order, log the operation and return the DTO', async () => {
    (updateOrderDynamoDbAdapter as jest.Mock).mockResolvedValueOnce(
      mockOrderModel,
    );

    const result = await updateOrderUseCase(mockId, mockUpdateOrderDto);

    expect(updateOrderDynamoDbAdapter).toHaveBeenCalledWith({
      ...OrderModel.fromDto(mockOrderModel),
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
    expect(logger.debug).toHaveBeenCalledWith('Updated Order', {
      updatedOrder: mockOrderModel,
    });
    expect(putMetric).toHaveBeenCalledWith({
      metrics,
      metricName: 'OrderUpdated',
    });
    expect(result).toEqual(mockOrderModel.toDto());
  });

  it('should validate the UpdateOrderDto and throw ValidationError if invalid', async () => {
    (validate as jest.Mock).mockResolvedValueOnce({
      isValid: false,
      validationErrors: ['mockError1'],
    });

    await expect(
      updateOrderUseCase(mockId, mockUpdateOrderDto),
    ).rejects.toThrow(ValidationError);
    expect(logger.error).toHaveBeenCalledWith('Order is invalid', {
      updateOrderDto: mockUpdateOrderDto,
      validationErrors: ['mockError1'],
    });
  });

  it('should handle and log errors during the order update process', async () => {
    const mockError = new Error('Test error');
    (updateOrderDynamoDbAdapter as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(
      updateOrderUseCase(mockId, mockUpdateOrderDto),
    ).rejects.toThrow(mockError);
    expect(logger.error).toHaveBeenCalledWith(
      'Error occurred during order update',
      {error: mockError},
    );
  });
});
