import middy from '@middy/core';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { ValidationError } from 'ajv';
import { ResourceNotFoundError } from '@errors/resource-not-found';
import { getLogger } from '@shared/monitor';
import { UnauthorizedError } from 'common-sdk';

const logger = getLogger({ serviceName: 'loadErrorMiddleware' });

export const loadErrorMiddleware = (): middy.MiddlewareObj<
  APIGatewayProxyEvent,
  APIGatewayProxyResult
> => {
  const onError: middy.MiddlewareFn<
    APIGatewayProxyEvent,
    APIGatewayProxyResult
  > = async (request): Promise<void> => {
    logger.debug('An error has been thrown...');

    if (request.error) {
      const error = request.error;
      logger.debug('Determining whether the error is a ValidationError.');
      if (error instanceof ValidationError) {
        logger.error('A ValidationError has been thrown.', { error });
        request.response = {
          statusCode: 400,
          body: JSON.stringify({
            message: error.message,
          }),
        };
        return;
      }
      logger.debug('Determining whether the error is an UnauthorisedError.');
      if (error instanceof UnauthorizedError) {
        logger.error('An UnauthorizedError has been thrown.', { error });
        request.response = {
          statusCode: 403,
          body: JSON.stringify({
            message: error.message,
          }),
        };
        return;
      }
      logger.debug('Determining whether the error is an UnauthorisedError.');
      if (error instanceof ResourceNotFoundError) {
        logger.error('An ResourceNotFoundError has been thrown.', { error });
        request.response = {
          statusCode: 400,
          body: JSON.stringify({
            message: error.message,
          }),
        };
        return;
      }
    }
    logger.error('An Unknown Error has been thrown.', { error: request.error });
    request.response = {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Some error occurred.',
      }),
    };
  };

  return {
    onError,
  };
};
