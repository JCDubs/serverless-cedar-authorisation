import {OrderDto} from '@dto/order-dto';
import {getOrderAdapter} from './api-get-order-adapter';
import {getOrderUseCase} from '@use-cases/get-order-use-case';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {v4 as uuid} from 'uuid';

// Mocking external dependencies
jest.mock('@shared/index');
jest.mock('@use-cases/get-order-use-case');
jest.mock('@shared/api-utils');

describe('getOrderAdapter tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch get details successfully', async () => {
    const mockId = uuid();

    const mockOrder: Partial<OrderDto> = {
      id: mockId,
      name: 'Mock Order',
    };

    const mockEvent: Partial<APIGatewayProxyEvent> = {
      pathParameters: {id: mockId},
    };

    const {validateId} = require('@shared/api-utils');
    validateId.mockReturnValueOnce(mockId);

    (getOrderUseCase as jest.Mock).mockResolvedValueOnce(mockOrder);

    const result = await getOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockOrder);
  });

  it('should handle errors', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      pathParameters: {id: 'invalid_id'},
    };
    const mockError = new Error('Invalid ID');

    const {validateId} = require('@shared/api-utils');
    validateId.mockImplementationOnce(() => {
      throw mockError;
    });

    const {errorHandler} = require('@shared/index');
    errorHandler.mockReturnValueOnce({
      statusCode: 400,
      body: JSON.stringify('Invalid ID'),
    });

    const result = await getOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe('Invalid ID');
  });
});
