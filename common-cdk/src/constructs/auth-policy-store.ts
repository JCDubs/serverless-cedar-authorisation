import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Resource } from 'aws-cdk-lib';

/**
 * Props for the PolicyStore construct.
 * @extends CityStackProps
 */
export interface PolicyStoreProps extends cdk.StackProps {
  policyDirectoryPath: string;
  serviceName: string;
  organisationName: string;
}

const AUTH_POLICY_STORE_BUCKET_SUFFIX = 'auth-policy-store';

/**
 * Construct to retrieve and use the City centralised authorisation
 * policy store S3 Bucket.
 * @extends Construct
 */
export class AuthPolicyStore extends Resource {
  readonly policyStoreBucket: s3.IBucket;

  constructor(
    scope: Construct,
    id: string,
    { policyDirectoryPath, serviceName, organisationName }: PolicyStoreProps
  ) {
    super(scope, id);

    this.policyStoreBucket = s3.Bucket.fromBucketName(
      this,
      'CentralAuthBucket',
      `${organisationName}-${AUTH_POLICY_STORE_BUCKET_SUFFIX}`
    );

    new BucketDeployment(this, 'PolicyDeployments', {
      destinationBucket: this.policyStoreBucket,
      sources: [Source.asset(policyDirectoryPath)],
      destinationKeyPrefix: `${serviceName}/policy`,
    });
  }
}
