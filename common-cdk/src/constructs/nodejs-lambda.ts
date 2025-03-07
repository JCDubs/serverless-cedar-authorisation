import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';

export interface NodejsLambdaProps
  extends Omit<
    lambdaNodejs.NodejsFunctionProps,
    'deadLetterQueue' | 'deadLetterQueueEnabled' | 'retryAttempts'
  > {
  /**
   * Whether the function is invoked asynchronously
   * @default false
   */
  isAsync?: boolean;

  /**
   * Dead letter queue max receive count (only used if isAsync is true)
   * @default 3
   */
  dlqMaxReceiveCount?: number;

  /**
   * Additional IAM policies to attach to the Lambda execution role
   * @default - No additional policies
   */
  additionalPolicies?: iam.PolicyStatement[];
}

export class NodejsLambda extends Construct {
  /**
   * The underlying Lambda function
   */
  public readonly lambdaFunction: lambda.Function;

  /**
   * The dead letter queue (only created if isAsync is true)
   */
  public readonly deadLetterQueue?: sqs.Queue;

  constructor(scope: Construct, id: string, props: NodejsLambdaProps) {
    super(scope, id);

    // Set default values
    const {
      isAsync = false,
      dlqMaxReceiveCount = 3,
      additionalPolicies = [],
      // Default values for L2 props
      runtime = lambda.Runtime.NODEJS_18_X,
      memorySize = 256,
      timeout = cdk.Duration.seconds(30),
      logRetention = logs.RetentionDays.TWO_WEEKS,
      architecture = lambda.Architecture.ARM_64,
      tracing = lambda.Tracing.ACTIVE,
      bundling = {},
      ...restProps
    } = props;

    // Create dead letter queue if function is async
    if (isAsync) {
      this.deadLetterQueue = new sqs.Queue(this, 'DeadLetterQueue', {
        retentionPeriod: cdk.Duration.days(14),
        visibilityTimeout: cdk.Duration.minutes(5),
      });
    }

    // Default bundling options
    const defaultBundling: lambdaNodejs.BundlingOptions = {
      minify: true,
      sourceMap: true,
      target: 'es2020',
      externalModules: [
        'aws-sdk', // AWS SDK v2
        // Don't exclude AWS SDK v3 modules, so they get bundled with the function
      ],
    };

    // Merge default bundling options with provided options
    const bundlingOptions = { ...defaultBundling, ...bundling };

    // Create the Lambda function
    this.lambdaFunction = new lambdaNodejs.NodejsFunction(this, 'Function', {
      runtime,
      memorySize,
      timeout,
      logRetention,
      architecture,
      tracing,
      bundling: bundlingOptions,
      deadLetterQueue: isAsync ? this.deadLetterQueue : undefined,
      deadLetterQueueEnabled: isAsync,
      retryAttempts: isAsync ? dlqMaxReceiveCount : undefined,
      ...restProps,
    });

    // Add additional policies if provided
    if (additionalPolicies.length > 0) {
      const policy = new iam.Policy(this, 'AdditionalPolicy', {
        statements: additionalPolicies,
      });
      policy.attachToRole(this.lambdaFunction.role!);
    }

    // Add CloudWatch dashboard metrics
    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: this.lambdaFunction.functionArn,
      description: 'Lambda Function ARN',
    });

    if (isAsync && this.deadLetterQueue) {
      new cdk.CfnOutput(this, 'DeadLetterQueueUrl', {
        value: this.deadLetterQueue.queueUrl,
        description: 'Dead Letter Queue URL',
      });
    }
  }
}
