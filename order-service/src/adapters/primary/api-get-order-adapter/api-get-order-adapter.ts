import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {wrapper} from '@shared/index';
import {getOrderUseCase} from '@use-cases/get-order-use-case';
import * as apiUtils from '@shared/api-utils';

/**
 * API Gateway Lambda Adapter for Order Get events
 */
export const getOrderAdapter = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const id = apiUtils.validateId(event.pathParameters?.id);
    const order = await getOrderUseCase(id);

    return {
      statusCode: 200,
      body: JSON.stringify(order),
    };
};

export const handler = wrapper(getOrderAdapter);
