import {createOrderUseCase} from './create-order-use-case';
import {validate, putMetric, logger, metrics} from '@shared/index';
import {ValidationError} from '@errors/index';
import {createOrderDynamoDbAdapter} from '@adapters/secondary/create-order-dynamo-db-adapter';
import {v4 as uuid} from 'uuid';
import {OrderModel} from '@models/order';
import {OrderDto} from '@dto/order-dto';

jest.mock('@shared/index', () => ({
  ...jest.requireActual('@shared/index'),
  putMetric: jest.fn(),
  validate: jest.fn(),
  metrics: jest.fn(),
  logger: {
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  },
}));

const mockId = uuid();
const mockNewOrderDto = {
  id: mockId,
  name: 'test order name',
  description: 'test order description',
  totalPrice: 123,
  lines: [],
};

jest.mock('@adapters/secondary/create-order-dynamo-db-adapter', () => ({
  createOrderDynamoDbAdapter: jest.fn(),
}));

describe('createOrderUseCase tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should throw a ValidationError if the order is invalid', async () => {
    (validate as jest.Mock).mockResolvedValueOnce({
      isValid: false,
      validationErrors: ['Some error'],
    });

    await expect(createOrderUseCase(mockNewOrderDto)).rejects.toThrow(
      ValidationError,
    );
    expect(logger.error).toHaveBeenCalledWith(
      'Order is invalid',
      expect.anything(),
    );
    expect(putMetric).toHaveBeenCalledWith({
      metrics,
      metricName: 'InvalidOrder',
    });
  });

  it('should successfully create an order if the order is valid', async () => {
    (validate as jest.Mock).mockResolvedValueOnce({isValid: true});
    const createdOrder = OrderModel.fromDto(
      mockNewOrderDto as unknown as OrderDto,
    );
    (createOrderDynamoDbAdapter as jest.Mock).mockResolvedValueOnce(
      createdOrder,
    );

    const result = await createOrderUseCase(createdOrder.toDTO());

    expect(result).toEqual(createdOrder.toDTO());
    expect(putMetric).toHaveBeenCalledWith({
      metrics,
      metricName: 'OrderCreated',
    });
    expect(logger.info).toHaveBeenCalledWith(
      'Created order',
      expect.anything(),
    );
    expect(logger.debug).toHaveBeenCalledWith(
      'Converted newOrderDto into order',
      expect.anything(),
    );
  });
});
