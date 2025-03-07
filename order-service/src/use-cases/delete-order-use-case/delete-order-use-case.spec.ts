import {deleteOrderUseCase} from './delete-order-use-case';
import {putMetric, logger, metrics} from '@shared/index';
import {deleteOrderDynamoDbAdapter} from '@adapters/secondary/delete-order-dynamo-db-adapter';
import {v4 as uuid} from 'uuid';

jest.mock('@shared/index', () => ({
  ...jest.requireActual('@shared/index'),
  putMetric: jest.fn(),
  logger: {
    error: jest.fn(),
    info: jest.fn(),
  },
}));

jest.mock('@adapters/secondary/delete-order-dynamo-db-adapter', () => ({
  deleteOrderDynamoDbAdapter: jest.fn(),
}));

describe('deleteOrderUseCase tests', () => {
  const mockId = uuid();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully delete an order and log the operation', async () => {
    await deleteOrderUseCase(mockId);

    expect(deleteOrderDynamoDbAdapter).toHaveBeenCalledWith(mockId);
    expect(logger.info).toHaveBeenCalledWith('Deleted Order with id', {
      id: mockId,
    });
    expect(putMetric).toHaveBeenCalledWith({
      metrics,
      metricName: 'OrderDeleted',
    });
  });

  it('should log an error and throw it if there is an issue deleting the order', async () => {
    const mockError = new Error('Delete failed');
    (deleteOrderDynamoDbAdapter as jest.Mock).mockRejectedValueOnce(mockError);

    await expect(deleteOrderUseCase(mockId)).rejects.toThrow(mockError);
    expect(logger.error).toHaveBeenCalledWith('Error deleting Order', {
      error: mockError,
    });
  });
});
