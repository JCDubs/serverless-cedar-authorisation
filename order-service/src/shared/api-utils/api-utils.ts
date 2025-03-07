import {ValidationError} from '@errors/validation-error';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {PaginationParams} from '../types';
export * from '../types';

/**
 * Validate body and parses to a JSON object.
 * @param body
 * @returns <T>
 */
export const validateBody = <T>({body}: APIGatewayProxyEvent): T => {
  if (!body) throw new ValidationError('No payload body');
  return JSON.parse(body) as T;
};

/**
 * Validate the provided id.
 * @param id
 * @returns id
 */
export const validateId = (id: string | undefined): string => {
  if (!id || !/^[A-Za-z0-9-]+$/.test(id)) {
    throw new ValidationError('Invalid ID format');
  }

  return id;
};

/**
 *
 * @param queryParams
 * @returns PaginationParams
 */
export const parseAndValidateQueryParameters = (queryParams: {
  offset?: string;
  limit?: string;
}): PaginationParams => {
  const limit = parseInt(queryParams?.limit || '10', 10);

  if (limit <= 0) {
    throw new ValidationError('Invalid pagination parameters');
  }

  return {offset: queryParams.offset, limit};
};
