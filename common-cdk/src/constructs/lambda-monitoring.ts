import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';

export interface LambdaMonitoringProps {
  /**
   * The Lambda function to monitor
   */
  lambdaFunction: lambda.Function;

  /**
   * Optional dead letter queue to monitor
   */
  deadLetterQueue?: sqs.Queue;

  /**
   * Whether to create CloudWatch dashboard
   * @default true
   */
  createDashboard?: boolean;

  /**
   * Whether to create CloudWatch alarms
   * @default true
   */
  createAlarms?: boolean;

  /**
   * Error rate threshold percentage for alarm
   * @default 5
   */
  errorRateThresholdPercent?: number;

  /**
   * Throttle count threshold for alarm
   * @default 1
   */
  throttleCountThreshold?: number;

  /**
   * Duration threshold in milliseconds for alarm (p95)
   * @default - depends on timeout (75% of timeout)
   */
  durationThresholdMillis?: number;

  /**
   * Dead letter queue message threshold for alarm
   * @default 1
   */
  dlqMessageThreshold?: number;

  /**
   * Alarm evaluation periods
   * @default 3
   */
  alarmEvaluationPeriods?: number;

  /**
   * Alarm actions (SNS topic ARNs)
   * @default - No alarm actions
   */
  alarmActions?: string[];
}

export class LambdaMonitoring extends Construct {
  /**
   * CloudWatch dashboard for the Lambda function
   */
  public readonly dashboard?: cloudwatch.Dashboard;

  /**
   * CloudWatch alarms for the Lambda function
   */
  public readonly alarms: {
    errors?: cloudwatch.Alarm;
    throttles?: cloudwatch.Alarm;
    duration?: cloudwatch.Alarm;
    dlqMessages?: cloudwatch.Alarm;
    iteratorAge?: cloudwatch.Alarm;
  } = {};

  /**
   * Key metrics for the Lambda function
   */
  public readonly metrics: {
    invocations: cloudwatch.Metric;
    errors: cloudwatch.Metric;
    throttles: cloudwatch.Metric;
    duration: cloudwatch.Metric;
    durationP95: cloudwatch.Metric;
    durationP99: cloudwatch.Metric;
    concurrentExecutions: cloudwatch.Metric;
    successRate: cloudwatch.MathExpression;
    errorRate: cloudwatch.MathExpression;
    dlqMessagesVisible?: cloudwatch.Metric;
    iteratorAge: cloudwatch.Metric;
  };

  constructor(scope: Construct, id: string, props: LambdaMonitoringProps) {
    super(scope, id);

    const {
      lambdaFunction,
      deadLetterQueue,
      createDashboard = true,
      createAlarms = true,
      errorRateThresholdPercent = 5,
      throttleCountThreshold = 1,
      dlqMessageThreshold = 1,
      alarmEvaluationPeriods = 3,
      alarmActions = [],
    } = props;

    // Calculate duration threshold if not provided (75% of timeout)
    const durationThresholdMillis =
      props.durationThresholdMillis || lambdaFunction.timeout?.toMilliseconds() * 0.75 || 3000;

    // Create metrics
    this.metrics = this.createMetrics(lambdaFunction, deadLetterQueue);

    // Create CloudWatch Dashboard
    if (createDashboard) {
      this.dashboard = this.createCloudWatchDashboard(
        lambdaFunction,
        this.metrics,
        deadLetterQueue
      );
    }

    // Create CloudWatch Alarms
    if (createAlarms) {
      this.alarms = this.createCloudWatchAlarms({
        lambdaFunction,
        metrics: this.metrics,
        deadLetterQueue,
        errorRateThresholdPercent,
        throttleCountThreshold,
        durationThresholdMillis,
        dlqMessageThreshold,
        alarmEvaluationPeriods,
        alarmActions,
      });
    }
  }

  /**
   * Create metrics for the Lambda function
   */
  private createMetrics(lambdaFunction: lambda.Function, deadLetterQueue?: sqs.Queue) {
    // Invocation metrics
    const invocations = lambdaFunction.metricInvocations({
      period: cdk.Duration.minutes(1),
      statistic: 'Sum',
    });

    const errors = lambdaFunction.metricErrors({
      period: cdk.Duration.minutes(1),
      statistic: 'Sum',
    });

    const throttles = lambdaFunction.metricThrottles({
      period: cdk.Duration.minutes(1),
      statistic: 'Sum',
    });

    const successRate = new cloudwatch.MathExpression({
      expression: '100 - 100 * errors / MAX([invocations, 1])',
      usingMetrics: {
        errors,
        invocations,
      },
      label: 'Success Rate (%)',
      period: cdk.Duration.minutes(1),
    });

    const errorRate = new cloudwatch.MathExpression({
      expression: '100 * errors / MAX([invocations, 1])',
      usingMetrics: {
        errors,
        invocations,
      },
      label: 'Error Rate (%)',
      period: cdk.Duration.minutes(1),
    });

    // Duration metrics
    const duration = lambdaFunction.metricDuration({
      period: cdk.Duration.minutes(1),
      statistic: 'Average',
    });

    const durationP95 = lambdaFunction.metricDuration({
      period: cdk.Duration.minutes(1),
      statistic: 'p95',
    });

    const durationP99 = lambdaFunction.metricDuration({
      period: cdk.Duration.minutes(1),
      statistic: 'p99',
    });

    // Concurrent executions
    const concurrentExecutions = lambdaFunction.metric('ConcurrentExecutions', {
      period: cdk.Duration.minutes(1),
      statistic: 'Maximum',
    });

    // Iterator age metric for event source mappings
    const iteratorAge = lambdaFunction.metric('IteratorAge', {
      period: cdk.Duration.minutes(1),
      statistic: 'Maximum',
    });

    // DLQ metrics if applicable
    let dlqMessagesVisible;
    if (deadLetterQueue) {
      dlqMessagesVisible = deadLetterQueue.metricApproximateNumberOfMessagesVisible({
        period: cdk.Duration.minutes(1),
        statistic: 'Maximum',
      });
    }

    return {
      invocations,
      errors,
      throttles,
      duration,
      durationP95,
      durationP99,
      concurrentExecutions,
      successRate,
      errorRate,
      dlqMessagesVisible,
      iteratorAge,
    };
  }

  /**
   * Create CloudWatch Dashboard for the Lambda function
   */
  private createCloudWatchDashboard(
    lambdaFunction: lambda.Function,
    metrics: any,
    deadLetterQueue?: sqs.Queue
  ): cloudwatch.Dashboard {
    const functionName = lambdaFunction.functionName;

    // Create dashboard
    const dashboard = new cloudwatch.Dashboard(this, 'Dashboard', {
      dashboardName: `Lambda-${functionName}`,
      start: '-P1D', // Last 24 hours
    });

    // Add widgets to dashboard
    dashboard.addWidgets(
      // Row 1: Invocations, Success Rate, Errors, Throttles
      new cloudwatch.GraphWidget({
        title: 'Invocations',
        left: [metrics.invocations],
        width: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Success Rate',
        left: [metrics.successRate],
        width: 6,
        leftYAxis: { min: 0, max: 100 },
      }),
      new cloudwatch.GraphWidget({
        title: 'Errors',
        left: [metrics.errors],
        width: 6,
      }),
      new cloudwatch.GraphWidget({
        title: 'Throttles',
        left: [metrics.throttles],
        width: 6,
      }),

      // Row 2: Duration, Concurrent Executions
      new cloudwatch.GraphWidget({
        title: 'Duration',
        left: [
          metrics.duration.with({ label: 'Average' }),
          metrics.durationP95.with({ label: 'p95' }),
          metrics.durationP99.with({ label: 'p99' }),
        ],
        width: 12,
      }),
      new cloudwatch.GraphWidget({
        title: 'Concurrent Executions',
        left: [metrics.concurrentExecutions],
        width: 12,
      })
    );

    // Add DLQ metrics if applicable
    if (deadLetterQueue && metrics.dlqMessagesVisible) {
      dashboard.addWidgets(
        new cloudwatch.GraphWidget({
          title: 'DLQ Messages',
          left: [metrics.dlqMessagesVisible],
          width: 24,
        })
      );
    }

    // Add iterator age metric for event source mappings
    dashboard.addWidgets(
      new cloudwatch.GraphWidget({
        title: 'Iterator Age (Event Source Mapping)',
        left: [metrics.iteratorAge],
        width: 24,
      })
    );

    // Add logs widget
    dashboard.addWidgets(
      new cloudwatch.LogQueryWidget({
        title: 'Recent Error Logs',
        logGroupNames: [lambdaFunction.logGroup.logGroupName],
        view: cloudwatch.LogQueryVisualizationType.TABLE,
        queryLines: [
          'fields @timestamp, @message',
          'filter level = "ERROR" or @message like /(?i)(error|exception|fail|timeout)/',
          'sort @timestamp desc',
          'limit 20',
        ],
        width: 24,
        height: 8,
      })
    );

    return dashboard;
  }

  /**
   * Create CloudWatch Alarms for the Lambda function
   */
  private createCloudWatchAlarms(options: {
    lambdaFunction: lambda.Function;
    metrics: any;
    deadLetterQueue?: sqs.Queue;
    errorRateThresholdPercent: number;
    throttleCountThreshold: number;
    durationThresholdMillis: number;
    dlqMessageThreshold: number;
    alarmEvaluationPeriods: number;
    alarmActions: string[];
  }) {
    const {
      lambdaFunction,
      metrics,
      deadLetterQueue,
      errorRateThresholdPercent,
      throttleCountThreshold,
      durationThresholdMillis,
      dlqMessageThreshold,
      alarmEvaluationPeriods,
      alarmActions,
    } = options;

    const functionName = lambdaFunction.functionName;
    const alarms: any = {};

    // Error rate alarm
    alarms.errors = new cloudwatch.Alarm(this, 'ErrorRateAlarm', {
      alarmName: `${functionName}-ErrorRate`,
      alarmDescription: `Lambda error rate exceeds ${errorRateThresholdPercent}%`,
      metric: metrics.errorRate,
      threshold: errorRateThresholdPercent,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: alarmEvaluationPeriods,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Throttle alarm
    alarms.throttles = new cloudwatch.Alarm(this, 'ThrottleAlarm', {
      alarmName: `${functionName}-Throttles`,
      alarmDescription: `Lambda is being throttled (>${throttleCountThreshold} throttles)`,
      metric: metrics.throttles,
      threshold: throttleCountThreshold,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: alarmEvaluationPeriods,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Duration alarm (p95)
    alarms.duration = new cloudwatch.Alarm(this, 'DurationAlarm', {
      alarmName: `${functionName}-Duration`,
      alarmDescription: `Lambda p95 duration exceeds ${durationThresholdMillis}ms`,
      metric: metrics.durationP95,
      threshold: durationThresholdMillis,
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: alarmEvaluationPeriods,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // DLQ alarm if applicable
    if (deadLetterQueue && metrics.dlqMessagesVisible) {
      alarms.dlqMessages = new cloudwatch.Alarm(this, 'DlqMessagesAlarm', {
        alarmName: `${functionName}-DLQ`,
        alarmDescription: `Lambda DLQ has messages (>${dlqMessageThreshold})`,
        metric: metrics.dlqMessagesVisible,
        threshold: dlqMessageThreshold,
        comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
        evaluationPeriods: alarmEvaluationPeriods,
        treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
      });
    }

    // Iterator age alarm for event source mappings
    // Only create if there's actual data (to avoid false alarms)
    alarms.iteratorAge = new cloudwatch.Alarm(this, 'IteratorAgeAlarm', {
      alarmName: `${functionName}-IteratorAge`,
      alarmDescription: 'Lambda event source mapping is falling behind',
      metric: metrics.iteratorAge,
      threshold: 60000, // 1 minute
      comparisonOperator: cloudwatch.ComparisonOperator.GREATER_THAN_THRESHOLD,
      evaluationPeriods: alarmEvaluationPeriods,
      treatMissingData: cloudwatch.TreatMissingData.NOT_BREACHING,
    });

    // Add alarm actions if provided
    if (alarmActions.length > 0) {
      Object.values(alarms).forEach((alarm) => {
        if (alarm) {
          alarmActions.forEach((action) =>
            alarm.addAlarmAction(new cloudwatch.SnsAction(cdk.Arn.parse(action)))
          );
        }
      });
    }

    return alarms;
  }
}
