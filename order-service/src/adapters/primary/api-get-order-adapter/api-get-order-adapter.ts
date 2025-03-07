import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {errorHandler} from '@shared/index';
import {wrapper} from '@shared/index';
import {getOrderUseCase} from '@use-cases/get-order-use-case';
import * as apiUtils from '@shared/api-utils';

/**
 * API Gateway Lambda Adapter for Order Get events
 */
export const getOrderAdapter = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    const id = apiUtils.validateId(event.pathParameters?.id);
    const order = await getOrderUseCase(id);

    return {
      statusCode: 200,
      body: JSON.stringify(order),
    };
  } catch (error) {
    return errorHandler(error);
  }
};

export const handler = wrapper(getOrderAdapter);
