import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {errorHandler} from '@shared/index';
import {wrapper} from '@shared/index';
import {OrderDTO} from '@dto/order-dto';
import {listOrderUseCase} from '@use-cases/list-order-use-case';
import * as apiUtils from '@shared/api-utils';

/**
 * API Gateway Lambda Adapter for Order List events
 */
export const listOrderAdapter = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const paginationParams: apiUtils.PaginationParams =
      apiUtils.parseAndValidateQueryParameters(
        event.queryStringParameters || {},
      );

    const orderList: apiUtils.ListItems<OrderDTO, string> =
      await listOrderUseCase(paginationParams);

    return {
      statusCode: 200,
      body: JSON.stringify(orderList),
    };
  } catch (error) {
    return errorHandler(error);
  }
};

export const handler = wrapper(listOrderAdapter);
