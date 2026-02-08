import { S3Client } from '@aws-sdk/client-s3';
import { environment } from '../../environments/environment';

/**
 * S3 Client Configuration
 * Creates a configured S3 client instance for interacting with AWS S3
 */
export const s3Client = new S3Client({
  region: environment.aws.region,
  credentials: {
    accessKeyId: environment.aws.accessKeyId,
    secretAccessKey: environment.aws.secretAccessKey
  }
});

/**
 * S3 Bucket name from environment
 */
export const S3_BUCKET_NAME = environment.aws.bucketName;

/**
 * AWS Region from environment
 */
export const AWS_REGION = environment.aws.region;
