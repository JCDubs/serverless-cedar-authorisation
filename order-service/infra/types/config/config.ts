
export enum Country {
  GB = 'GB',
  US = 'US',
}

export enum Environment {
  TEST = 'TEST',
  PROD = 'PROD',
}

export enum Domain {
  ORDER = 'Order',
}

export interface Config {
  country: Country;
  stage: string;
  environment: Environment;
  service: string;
  serviceCode: string;
  account: string;
  domain: Domain;
  region: string;
}
