import {DynamoDBService} from './dynamo-db-service';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {marshall} from '@aws-sdk/util-dynamodb';

// Mock the external dependencies
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@shared/index');

describe('DynamoDBService', () => {
  let service: DynamoDBService;
  let mockSend: jest.SpyInstance;

  beforeEach(() => {
    mockSend = jest.spyOn(DynamoDBClient.prototype, 'send');
    service = new DynamoDBService();
  });

  it('should create an item', async () => {
    const mockParams = {TableName: 'test', Item: {}};
    await service.createItem(mockParams);
    expect(mockSend).toHaveBeenCalled();
  });

  it('should throw an error if creating an item fails', async () => {
    const mockParams = {TableName: 'test', Item: {}};
    mockSend.mockRejectedValueOnce(new Error('Failed to create item'));
    await expect(service.createItem(mockParams)).rejects.toThrow(
      'Failed to create item',
    );
  });

  it('should retrieve an item', async () => {
    const mockItem = {id: '1', value: 'test'};
    mockSend.mockResolvedValueOnce({Item: mockItem});
    const mockParams = {TableName: 'test', Key: marshall({id: '1'})};
    const result = await service.getItem(mockParams);
    expect(result).toEqual(mockItem);
    expect(mockSend).toHaveBeenCalled();
  });

  it('should throw an error if retrieving an item fails', async () => {
    const mockParams = {TableName: 'test', Key: marshall({id: '1'})};
    mockSend.mockRejectedValueOnce(new Error('Failed to get item'));
    await expect(service.getItem(mockParams)).rejects.toThrow(
      'Failed to get item',
    );
  });

  it('should list items', async () => {
    const mockParams = {TableName: 'test'};
    const mockItems = [{id: '1'}];
    mockSend.mockResolvedValueOnce({Items: mockItems});
    const result = await service.listItems(mockParams);
    expect(result.Items).toEqual(mockItems);
    expect(mockSend).toHaveBeenCalled();
  });

  it('should throw an error when listing items fails', async () => {
    const mockParams = {TableName: 'test'};
    mockSend.mockRejectedValueOnce(new Error('Failed to list items'));
    await expect(service.listItems(mockParams)).rejects.toThrow(
      'Failed to list items',
    );
  });

  it('should update an item', async () => {
    const mockParams = {TableName: 'test', Key: marshall({id: '1'})};
    await service.updateItem(mockParams);
    expect(mockSend).toHaveBeenCalled();
  });

  it('should throw an error when updating items fails', async () => {
    const mockParams = {TableName: 'test', Key: marshall({id: '1'})};
    mockSend.mockRejectedValueOnce(new Error('Failed to update item'));
    await expect(service.updateItem(mockParams)).rejects.toThrow(
      'Failed to update item',
    );
  });

  it('should delete an item', async () => {
    const mockParams = {TableName: 'test', Key: marshall({id: '1'})};
    await service.deleteItem(mockParams);
    expect(mockSend).toHaveBeenCalled();
  });

  it('should throw an error when deleting an item fails', async () => {
    const mockParams = {TableName: 'test', Key: marshall({id: '1'})};
    mockSend.mockRejectedValueOnce(new Error('Failed to delete item'));
    await expect(service.deleteItem(mockParams)).rejects.toThrow(
      'Failed to delete item',
    );
  });
});
