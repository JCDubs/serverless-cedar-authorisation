import {OrderDto} from '@dto/order-dto';
import {createOrderAdapter} from './api-create-order-adapter';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {v4 as uuid} from 'uuid';

// Mocking external dependencies
jest.mock('@aws-lambda-powertools/logger');
jest.mock('@aws-lambda-powertools/metrics');
jest.mock('@aws-lambda-powertools/tracer');
jest.mock('@shared/index');
jest.mock('@dto/order-dto');
jest.mock('@use-cases/create-order-use-case');
jest.mock('@shared/api-utils');

describe('createOrderAdapter', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle order creation successfully', async () => {
    const mockId = uuid();

    const mockOrder: Partial<OrderDto> = {
      id: mockId,
      name: 'New Order',
    };

    const mockEvent: Partial<APIGatewayProxyEvent> = {
      body: JSON.stringify({name: 'New Order'}),
    };

    const {validateBody} = require('@shared/api-utils');
    validateBody.mockReturnValueOnce(mockOrder);

    const {createOrderUseCase} = require('@use-cases/create-order-use-case');
    createOrderUseCase.mockResolvedValueOnce(mockOrder);

    const result = await createOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual(mockOrder);
  });

  it('should handle errors', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {};
    const mockError = new Error('An error occurred');

    const {validateBody} = require('@shared/api-utils');
    validateBody.mockImplementationOnce(() => {
      throw mockError;
    });

    const {errorHandler} = require('@shared/index');
    errorHandler.mockReturnValueOnce({
      statusCode: 500,
      body: JSON.stringify('An error occurred'),
    });

    const result = await createOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(errorHandler).toHaveBeenCalledWith(mockError);
    expect(result.statusCode).toBe(500);
  });
});
