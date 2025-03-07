import {APIGatewayProxyEvent} from 'aws-lambda';
import {v4 as uuid} from 'uuid';
import {deleteOrderAdapter} from './api-delete-order-adapter';

jest.mock('@shared/index');
jest.mock('@use-cases/delete-order-use-case');
jest.mock('@shared/api-utils');

describe('deleteOrderAdapter tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle order deletion successfully', async () => {
    const mockId = uuid();
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      pathParameters: {id: mockId},
    };

    const {validateId} = require('@shared/api-utils');
    validateId.mockReturnValueOnce(mockId);

    const result = await deleteOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(204);
    expect(result.body).toBe('');
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

    const result = await deleteOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe('Invalid ID');
  });
});
