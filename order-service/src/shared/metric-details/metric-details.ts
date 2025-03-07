import {Metrics} from '@aws-lambda-powertools/metrics';

export interface MetricDetails {
  metrics: Metrics;
  metricName: string;
  count?: number;
  dimensions?: {[key: string]: string};
}
