import {OrderDto} from '@dto/order-dto';
import {listOrderAdapter} from './api-list-order-adapter';
import {listOrderUseCase} from '@use-cases/list-order-use-case';
import * as apiUtils from '@shared/api-utils';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {v4 as uuid} from 'uuid';

jest.mock('@shared/index');
jest.mock('@use-cases/list-order-use-case');
jest.mock('@shared/api-utils');

describe('listOrderAdapter tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should list order successfully with pagination parameters', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {limit: '10', startAfter: 'abc'},
    };
    const mockPaginationParams: apiUtils.PaginationParams = {
      limit: 10,
    };
    const mockOrderList: apiUtils.ListItems<OrderDto, string> = {
      items: [
        {
          id: uuid(),
          name: 'Order 1',
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
        },
        {
          id: uuid(),
          name: 'Order 2',
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
        },
      ],
      offset: '2',
    };

    const {parseAndValidateQueryParameters} = require('@shared/api-utils');
    parseAndValidateQueryParameters.mockReturnValueOnce(mockPaginationParams);

    (listOrderUseCase as jest.Mock).mockResolvedValueOnce(mockOrderList);

    const result = await listOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockOrderList);
  });

  it('should list order successfully without offset pagination parameters', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {limit: '10', startAfter: 'abc'},
    };
    const mockPaginationParams: apiUtils.PaginationParams = {
      limit: 10,
    };
    const mockOrderList: apiUtils.ListItems<OrderDto, string> = {
      items: [
        {
          id: uuid(),
          name: 'Order 1',
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
        },
        {
          id: uuid(),
          name: 'Order 2',
          createdAt: new Date().toUTCString(),
          updatedAt: new Date().toUTCString(),
        },
      ],
    };

    const {parseAndValidateQueryParameters} = require('@shared/api-utils');
    parseAndValidateQueryParameters.mockReturnValueOnce(mockPaginationParams);

    (listOrderUseCase as jest.Mock).mockResolvedValueOnce(mockOrderList);

    const result = await listOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual(mockOrderList);
  });

  it('should handle errors', async () => {
    const mockEvent: Partial<APIGatewayProxyEvent> = {
      queryStringParameters: {invalid: 'param'},
    };
    const mockError = new Error('Invalid parameters');

    const {parseAndValidateQueryParameters} = require('@shared/api-utils');
    parseAndValidateQueryParameters.mockImplementationOnce(() => {
      throw mockError;
    });

    const {errorHandler} = require('@shared/index');
    errorHandler.mockReturnValueOnce({
      statusCode: 400,
      body: JSON.stringify('Invalid parameters'),
    });

    const result = await listOrderAdapter(mockEvent as APIGatewayProxyEvent);

    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toBe('Invalid parameters');
  });
});
