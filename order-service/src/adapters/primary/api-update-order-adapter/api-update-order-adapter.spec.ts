import {OrderDto, UpdateOrderDto} from '@dto/order-dto';
import {updateOrderAdapter} from './api-update-order-adapter';
import {updateOrderUseCase} from '@use-cases/update-order-use-case';
import {v4 as uuid} from 'uuid';
import {APIGatewayProxyEvent} from 'aws-lambda';

jest.mock('@shared/index');
jest.mock('@use-cases/update-order-use-case');
jest.mock('@shared/api-utils');

describe('updateOrderAdapter tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update order successfully', async () => {
    const mockId = uuid();
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      pathParameters: {id: mockId},
      body: JSON.stringify({id: mockId, name: 'Updated Order'}),
    };
    const mockOrder: OrderDto = {
      id: mockId,
      name: 'Order 1',
      createdAt: new Date().toUTCString(),
      updatedAt: new Date().toUTCString(),
      // Insert other properties
    };
    const mockUpdatedOrder: UpdateOrderDto = {
      // Insert other properties
    };

    const {validateId, validateBody} = require('@shared/api-utils');
    validateId.mockReturnValueOnce('123');
    validateBody.mockReturnValueOnce(mockOrder);

    (updateOrderUseCase as jest.Mock).mockResolvedValueOnce(mockUpdatedOrder);

    const result = await updateOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(201);
    expect(JSON.parse(result.body)).toEqual(mockUpdatedOrder);
  });

  it('should handle errors', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      pathParameters: {id: 'invalid'},
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

    const result = await updateOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe('Invalid ID');
  });
});
