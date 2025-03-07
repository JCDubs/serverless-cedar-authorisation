import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';

export interface CentralPolicyStoreStackProps extends cdk.StackProps {
  organisationId: string;
  organisationName: string;
}

export class CentralPolicyStoreStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: CentralPolicyStoreStackProps) {
    super(scope, id, props);

    const centralAuthBucket = new s3.Bucket(this, 'CityAuthPolicyStore', {
      bucketName: `${props.organisationName}-auth-policy-store`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      versioned: true,
      encryption: s3.BucketEncryption.S3_MANAGED,
    });

    const bucketPolicy = new s3.BucketPolicy(this, 'CityAuthPolicyStorePolicy', {
      bucket: centralAuthBucket,
    });

    bucketPolicy.document.addStatements(
      new iam.PolicyStatement({
        actions: ['s3:GetObject', 's3:ListBucket', 's3:PutObject'],
        effect: iam.Effect.ALLOW,
        principals: [new iam.OrganizationPrincipal(props.organisationId)],
        resources: [centralAuthBucket.bucketArn, `${centralAuthBucket.bucketArn}/*`],
      })
    );
  }
}
