import {MetricUnits} from '@aws-lambda-powertools/metrics';
import {MetricDetails} from '@shared/metric-details';

/**
 * Utility function to send a metric to CloudWatch.
 * @param metricName
 * @param count
 * @param dimensions
 */
export const putMetric = (metricDetails: MetricDetails) => {
  const {metrics, metricName, count, dimensions} = metricDetails;

  if (dimensions && Object.keys(dimensions).length) {
    const singleMetricWithDimensions = metrics.singleMetric();
    singleMetricWithDimensions.addDimensions(dimensions);
    singleMetricWithDimensions.addMetric(
      metricName,
      MetricUnits.Count,
      count || 1,
    );
  }

  // Always send a metric without dimensions for Dashboard usage
  const singleMetricWithoutDimensions = metrics.singleMetric();
  singleMetricWithoutDimensions.addMetric(
    metricName,
    MetricUnits.Count,
    count || 1,
  );
};
