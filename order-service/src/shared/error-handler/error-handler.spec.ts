import {errorHandler} from './error-handler';
import {logger} from '@shared/monitor';

// Mocking console.error
jest.spyOn(console, 'error').mockImplementation(() => {});

// Mocking the logger
jest.mock('@shared/monitor', () => ({
  logger: {
    error: jest.fn(),
  },
}));

// Mocking Metrics
jest.mock('@aws-lambda-powertools/metrics', () => {
  return {
    Metrics: jest.fn().mockImplementation(() => {
      return {
        addMetric: jest.fn(),
      };
    }),
    MetricUnits: {
      Count: 'Count',
    },
  };
});

describe('errorHandler', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle ValidationError', () => {
    const error = new Error('Validation issue');
    error.name = 'ValidationError';

    const response = errorHandler(error);

    expect(response).toEqual({
      statusCode: 400,
      body: JSON.stringify('Validation issue'),
    });
    expect((logger.error as jest.Mock).mock.calls.length).toBe(1);
    expect((logger.error as jest.Mock).mock.calls[0][0]).toBe(
      'Validation issue',
    );
  });

  it('should handle ResourceNotFound', () => {
    const error = new Error('Resource not found');
    error.name = 'ResourceNotFound';

    const response = errorHandler(error);

    expect(response).toEqual({
      statusCode: 404,
      body: JSON.stringify('Resource not found'),
    });
    expect((logger.error as jest.Mock).mock.calls.length).toBe(1);
    expect((logger.error as jest.Mock).mock.calls[0][0]).toBe(
      'Resource not found',
    );
  });

  it('should handle unknown errors', () => {
    const error = new Error('Random error');

    const response = errorHandler(error);

    expect(response).toEqual({
      statusCode: 500,
      body: JSON.stringify('An error has occurred'),
    });
    expect((logger.error as jest.Mock).mock.calls.length).toBe(1);
    expect((logger.error as jest.Mock).mock.calls[0][0]).toBe(
      'An error has occurred',
    );
  });
});
