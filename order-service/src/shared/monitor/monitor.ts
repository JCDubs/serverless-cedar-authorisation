import {Logger} from '@aws-lambda-powertools/logger';
import { ConstructorOptions } from '@aws-lambda-powertools/logger/lib/types';
import {Metrics} from '@aws-lambda-powertools/metrics';
import {Tracer} from '@aws-lambda-powertools/tracer';

export const tracer = new Tracer();
export const getLogger = (args: ConstructorOptions) =>  new Logger(args);
export const metrics = new Metrics();
