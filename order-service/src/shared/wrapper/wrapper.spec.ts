import {wrapper} from './wrapper';
import middy from '@middy/core';

jest.mock('@aws-lambda-powertools/logger');
jest.mock('@aws-lambda-powertools/tracer');
jest.mock('@middy/core');
jest.mock('@shared/monitor');

describe('Wrapper tests', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should wrap the handler with powertools and middy middlewares', () => {
    const dummyHandler = jest.fn();
    const mockUse = jest.fn().mockImplementation(() => mockMiddy);
    const mockMiddy = {
      use: mockUse,
    };
    (middy as jest.Mock).mockImplementation(() => mockMiddy);

    wrapper(dummyHandler);

    // Assert that middy was called with the handler
    expect(middy).toHaveBeenCalledWith(dummyHandler);
    expect(mockUse).toBeCalledTimes(2);
  });
});
