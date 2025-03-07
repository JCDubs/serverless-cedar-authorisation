import {OrderModel} from '@models/order';
import {updateOrderDynamoDbAdapter} from './update-order-dynamo-db-adapter';
import {v4 as uuid} from 'uuid';
import {DynamoDBClient} from '@aws-sdk/client-dynamodb';

jest.mock('@aws-sdk/client-dynamodb');

describe('updateOrderDynamoDbAdapter', () => {
  const mockId = uuid();
  const mockOrder: OrderModel = OrderModel.fromDto({
    id: mockId,
    name: 'Updated Customer',
    // Other required properties
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  it('should update the order and return the updated order', async () => {
    const mockReturnData = {
      Attributes: {
        PK: {S: `UPDATE#${mockId}`},
        id: {S: mockId},
        name: {S: mockOrder.name},
        createdAt: {S: mockOrder.createdAt},
        updatedAt: {S: mockOrder.updatedAt},
      },
    };

    // Mocking the DynamoDB updateItem response
    const mockedUpdateItem = jest.fn();
    mockedUpdateItem.mockResolvedValueOnce(mockReturnData);

    (DynamoDBClient.prototype.send as jest.Mock) = mockedUpdateItem;

    const result = await updateOrderDynamoDbAdapter(mockOrder);
    expect(result.name).toEqual(mockOrder.name);
  });

  it('should throw an error when updating fails', async () => {
    // Mocking the DynamoDB updateItem to throw an error
    const mockedUpdateItem = jest.fn();
    mockedUpdateItem.mockRejectedValueOnce(new Error('Update failed'));

    (DynamoDBClient.prototype.send as jest.Mock) = mockedUpdateItem;

    await expect(updateOrderDynamoDbAdapter(mockOrder)).rejects.toThrow(
      'Update failed',
    );
  });
});
