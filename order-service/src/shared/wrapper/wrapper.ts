import {injectLambdaContext} from '@aws-lambda-powertools/logger';
import {captureLambdaHandler} from '@aws-lambda-powertools/tracer';
import middy from '@middy/core';
import {Handler} from 'aws-lambda';
import {getLogger, tracer} from '@shared/monitor';
import { loadCedarAuthorization } from 'common-sdk';
import { authorizationConfig, authorizationServiceConfig } from '@config/config';
import { loadErrorMiddleware } from '@errors/error-middleware';

const logger = getLogger({serviceName: 'order-service'});

/**
 * Lambda Middy wrapper.
 * @param handler
 * @returns MiddyfiedHandler
 */
export const wrapper = <T extends Handler>(
  handler: T,
): middy.MiddyfiedHandler => {
  return middy(handler)
    .use(injectLambdaContext(logger))
    .use(captureLambdaHandler(tracer))
    .use(loadCedarAuthorization(authorizationConfig, authorizationServiceConfig))
    .use(loadErrorMiddleware());
};
