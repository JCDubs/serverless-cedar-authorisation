import {APIGatewayProxyEvent, APIGatewayProxyResult} from 'aws-lambda';
import {wrapper} from '@shared/index';
import {NewOrderDTO} from '@dto/order-dto';
import {createOrderUseCase} from '@use-cases/create-order-use-case';
import * as apiUtils from '@shared/api-utils';

/**
 * API Gateway Lambda Adapter for Order Create events
 */
export const createOrderAdapter = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  const order: NewOrderDTO = apiUtils.validateBody<NewOrderDTO>(event);
    const created = await createOrderUseCase(order);

    return {
      statusCode: 201,
      body: JSON.stringify(created),
    };
};

export const handler = wrapper(createOrderAdapter);
