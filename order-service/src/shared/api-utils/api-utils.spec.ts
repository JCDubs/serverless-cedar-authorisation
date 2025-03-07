import {ValidationError} from '@errors/validation-error';
import {APIGatewayProxyEvent} from 'aws-lambda';
import {
  validateBody,
  validateId,
  parseAndValidateQueryParameters,
} from './api-utils';

describe('api utils test', () => {
  describe('validateBody', () => {
    it('should validate and parse a valid JSON body', () => {
      const mockEvent: Partial<APIGatewayProxyEvent> = {
        body: JSON.stringify({foo: 'bar'}),
      };

      const result = validateBody(mockEvent as APIGatewayProxyEvent);
      expect(result).toEqual({foo: 'bar'});
    });

    it('should throw ValidationError for undefined body', () => {
      const mockEvent: Partial<APIGatewayProxyEvent> = {
        body: null,
      };

      expect(() =>
        validateBody(mockEvent as APIGatewayProxyEvent),
      ).toThrowError(new ValidationError('No payload body'));
    });
  });

  describe('validateId', () => {
    it('should validate a valid id format', () => {
      expect(validateId('abcd1234')).toEqual('abcd1234');
    });

    it('should throw ValidationError for undefined id', () => {
      expect(() => validateId(undefined)).toThrowError(
        new ValidationError('Invalid ID format'),
      );
    });

    it('should throw ValidationError for invalid id format', () => {
      expect(() => validateId('!@#$%^&*')).toThrowError(
        new ValidationError('Invalid ID format'),
      );
    });
  });

  describe('parseAndValidateQueryParameters', () => {
    it('should return default pagination params for undefined queryParams', () => {
      expect(parseAndValidateQueryParameters({})).toEqual({
        offset: undefined,
        limit: 10,
      });
    });

    it('should parse and return valid pagination params', () => {
      expect(
        parseAndValidateQueryParameters({offset: '20', limit: '30'}),
      ).toEqual({
        offset: '20',
        limit: 30,
      });
    });

    it('should throw ValidationError for invalid limit', () => {
      expect(() =>
        parseAndValidateQueryParameters({limit: '-10'}),
      ).toThrowError(new ValidationError('Invalid pagination parameters'));
    });
  });
});
