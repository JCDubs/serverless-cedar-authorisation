import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {errorHandler} from '@shared/index';
import {wrapper} from '@shared/index';
import {UpdatedOrderDTO} from '@dto/order-dto';
import {updateOrderUseCase} from '@use-cases/update-order-use-case';
import * as apiUtils from '@shared/api-utils';

/**
 * API Gateway Lambda Adapter for Order Update events
 */
export const updateOrderAdapter = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  try {
    if (!event.pathParameters?.id || !event.body) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Bad Request',
        }),
      };
    }

    const id = apiUtils.validateId(event.pathParameters?.id);
    const order: UpdatedOrderDTO =
      apiUtils.validateBody<UpdatedOrderDTO>(event);
    const updated = await updateOrderUseCase(id, order);

    return {
      statusCode: 201,
      body: JSON.stringify(updated),
    };
  } catch (error) {
    return errorHandler(error);
  }
};

export const handler = wrapper(updateOrderAdapter);
