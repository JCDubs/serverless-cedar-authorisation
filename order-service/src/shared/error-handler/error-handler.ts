import {APIGatewayProxyResult} from 'aws-lambda';
import {getLogger} from '@shared/monitor';
import {MetricUnits, Metrics} from '@aws-lambda-powertools/metrics';

const metrics = new Metrics();
const logger = getLogger({serviceName: 'error-handler'});

/**
 * Utility function to handle errors in API Gateway Lambda functions.
 * @param error
 * @returns
 */
export function errorHandler(error: Error | unknown): APIGatewayProxyResult {
  console.error(error);

  let errorName = 'UnknownError';
  let errorMessage = 'An error has occurred';
  let statusCode = 500;

  if (error instanceof Error) {
    switch (error.name) {
      case 'ValidationError':
        errorMessage = error.message;
        statusCode = 400;
        errorName = 'ValidationError';
        break;
      case 'ResourceNotFound':
        errorMessage = error.message;
        statusCode = 404;
        errorName = 'ResourceNotFound';
        break;
    }
  }
  logger.error(errorMessage);
  metrics.addMetric(`ERROR=${errorName}`, MetricUnits.Count, 1);
  return {
    statusCode: statusCode,
    body: JSON.stringify(errorMessage),
  };
}
