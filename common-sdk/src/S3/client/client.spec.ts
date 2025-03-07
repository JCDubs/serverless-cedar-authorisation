import { S3Client } from './client';

jest.mock('../utils', () => ({
  getLargePayloadBucketName: jest.fn().mockReturnValue('test-bucket'),
}));

const testObject = 'test-object';
const testBody = 'test-body';
const testBucket = 'test-bucket';

describe('S3Client Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Get Object Tests', () => {
    it('should get an object from S3', async () => {
      const s3Client = new S3Client({});
      jest.spyOn(s3Client, 'send').mockResolvedValueOnce({
        Body: { transformToString: () => testBody },
      } as never);
      const result = await s3Client.getObject(testObject, testBucket);
      expect(result).toBe(testBody);
    });

    it('should return null when object does not exist in the response', async () => {
      const s3Client = new S3Client({});
      jest.spyOn(s3Client, 'send').mockResolvedValueOnce({} as never);
      const result = await s3Client.getObject(testObject, testBucket);
      expect(result).toBeUndefined();
    });

    it('should log error and rethrow if get operation fails', async () => {
      const errorMessage = 'Get from S3 failed';
      const s3Client = new S3Client({});
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(s3Client, 'send').mockRejectedValueOnce(new Error(errorMessage) as never);

      await expect(s3Client.getObject(testObject, testBucket)).rejects.toThrow(errorMessage);
    });
  });
});
