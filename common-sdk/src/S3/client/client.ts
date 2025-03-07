import { S3Client as Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Logger } from '@aws-lambda-powertools/logger';

const logger = new Logger({ serviceName: 's3-client' });

export class S3Client extends Client {
  /**
   * Get an object from an S3 bucket.
   * @param key The key of the object to retrieve.
   * @param bucket The bucket name.
   * @throws {Error}s3
   * @returns The object as a string.
   */
  async getObject(key: string, bucket: string) {
    try {
      const command = new GetObjectCommand({
        Bucket: bucket,
        Key: key,
      });

      const response = await this.send(command);
      return await response.Body?.transformToString();
    } catch (error) {
      logger.error(`Failed to retrieve ${key} from the ${bucket} S3 bucket`, {
        error: (error as Error).message,
      });
      throw error;
    }
  }
}
