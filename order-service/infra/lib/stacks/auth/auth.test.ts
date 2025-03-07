import {App} from 'aws-cdk-lib';
import {Template} from 'aws-cdk-lib/assertions';
import {
  createConfig,
  processTemplate,
  testData,
} from '@infra/test/utils/test-utils';
import {StatefulStack} from '@infra/lib/stacks/stateful';
import type {config as realConfig} from '@infra/config';

jest.mock('../../../../global/config', () => {
  const config: typeof realConfig = {
    country: 'gb',
    stage: 'fdv',
    environment: 'TEST',
    service: 'orderService',
    serviceCode: 'odr',
    account: 'featuredev',
    domain: 'ORDER',
    region: 'eu-west-1',
  };

  return {
    config,
  };
});

describe('All orderService stacks created and has correct properties', () => {
  it.each(testData)(
    'StatefulStack has expected configuration for %p',
    (environment: string, stage: string, account: string) => {
      const app = new App();
      const stack = new StatefulStack(
        app,
        'StatefulStackTest',
        createConfig(environment, stage, account),
      );
      expect(processTemplate(Template.fromStack(stack))).toMatchSnapshot();
    },
  );
});
