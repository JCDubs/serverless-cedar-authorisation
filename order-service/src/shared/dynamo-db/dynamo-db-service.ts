import {
  DynamoDBClient,
  PutItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  PutItemCommandInput,
  GetItemCommandInput,
  UpdateItemCommandInput,
  DeleteItemCommandInput,
  ScanCommandInput,
  ScanCommand,
} from '@aws-sdk/client-dynamodb';
import {getLogger} from '@shared/index';

const logger = getLogger({serviceName: 'dynamo-db-service'})

/**
 * Service for performing CRUD operations on DynamoDB.
 */
export class DynamoDBService {
  private readonly client: DynamoDBClient;

  /**
   * Initializes a new instance of DynamoDBService.
   */
  constructor() {
    // Initialize the DynamoDB client
    this.client = new DynamoDBClient({});
  }

  /**
   * Create a new item in the DynamoDB table.
   * @param params - The parameters for the PutItemCommand.
   */
  async createItem(params: PutItemCommandInput) {
    try {
      await this.client.send(new PutItemCommand(params));
    } catch (error) {
      logger.error('Error creating item:', {error});
      throw error;
    }
  }

  /**
   * Retrieve an item from the DynamoDB table.
   * @param params - The parameters for the GetItemCommand.
   * @returns Promise resolved with the retrieved item or null if not found.
   */
  async getItem(params: GetItemCommandInput) {
    try {
      const result = await this.client.send(new GetItemCommand(params));
      return result.Item || null;
    } catch (error) {
      logger.error('Error getting item:', {error});
      throw error;
    }
  }

  /**
   * List all items in the DynamoDB table.
   * @param params - The ScanCommandInput parameters.
   */
  async listItems(params: ScanCommandInput) {
    try {
      return await this.client.send(new ScanCommand(params));
    } catch (error) {
      logger.error('Error getting item:', {error});
      throw error;
    }
  }

  /**
   * Update an existing item in the DynamoDB table.
   * @param params - The parameters for the UpdateItemCommand.
   */
  async updateItem(params: UpdateItemCommandInput) {
    try {
      return await this.client.send(new UpdateItemCommand(params));
    } catch (error) {
      logger.error('Error updating item:', {error});
      throw error;
    }
  }

  /**
   * Delete an item from the DynamoDB table.
   * @param params - The parameters for the DeleteItemCommand.
   */
  async deleteItem(params: DeleteItemCommandInput) {
    try {
      await this.client.send(new DeleteItemCommand(params));
    } catch (error) {
      logger.error('Error deleting item:', {error});
      throw error;
    }
  }
}
