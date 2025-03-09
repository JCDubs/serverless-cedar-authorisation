import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {wrapper} from '@shared/index';
import {deleteOrderUseCase} from '@use-cases/delete-order-use-case';
import * as apiUtils from '@shared/api-utils';

/**
 * API Gateway Lambda Adapter for Order Delete events
 */
export const deleteOrderAdapter = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const id = apiUtils.validateId(event.pathParameters?.id);
    await deleteOrderUseCase(id);

    return {
      statusCode: 204,
      body: '',
    };
};

export const handler = wrapper(deleteOrderAdapter);
