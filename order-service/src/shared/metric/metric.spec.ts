import {putMetric} from './metric';
import {MetricUnits, Metrics} from '@aws-lambda-powertools/metrics';

describe('putMetric', () => {
  const mockAddDimensions = jest.fn();
  const mockAddMetric = jest.fn();
  const mockSingleMetric = jest.spyOn(Metrics.prototype, 'singleMetric');

  beforeEach(() => {
    mockSingleMetric.mockReturnValue(mockSingleMetric as unknown as Metrics);
    mockSingleMetric.mockReturnValue({
      addDimensions: mockAddDimensions,
      addMetric: mockAddMetric,
    } as unknown as Metrics);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should send metric without dimensions', () => {
    // const mockAddMetric = jest.spyOn(Metrics.prototype, 'addMetric');

    const metricDetails = {
      metrics: new Metrics({namespace: 'test'}),
      metricName: 'TestMetric',
    };

    putMetric(metricDetails);

    expect(mockAddMetric).toHaveBeenCalledWith(
      'TestMetric',
      MetricUnits.Count,
      1,
    );
    expect(mockSingleMetric).toHaveBeenCalledTimes(1);
    expect(mockAddMetric).toHaveBeenCalledTimes(1);
  });

  it('should send metric with dimensions', () => {
    const metricDetails = {
      metrics: new Metrics({namespace: 'test'}),
      metricName: 'TestMetricWithDimensions',
      dimensions: {
        Service: 'TestService',
      },
    };

    putMetric(metricDetails);

    expect(mockAddDimensions).toHaveBeenCalledWith({
      Service: 'TestService',
    });
    expect(mockAddMetric).toHaveBeenCalledWith(
      'TestMetricWithDimensions',
      MetricUnits.Count,
      1,
    );
    expect(mockSingleMetric).toHaveBeenCalledTimes(2);
    expect(mockAddMetric).toHaveBeenCalledTimes(2);
  });

  it('should send metric with a count other than 1', () => {
    const metricDetails = {
      metrics: new Metrics({namespace: 'test'}),
      metricName: 'TestMetricWithCount',
      count: 5,
    };

    putMetric(metricDetails);

    expect(mockSingleMetric).toHaveBeenCalledTimes(1);
    expect(mockAddMetric).toHaveBeenCalledWith(
      'TestMetricWithCount',
      MetricUnits.Count,
      5,
    );
  });
});
