import {getLogger} from '@shared/monitor';
import AJV, {ErrorObject, Schema} from 'ajv';
import addFormats from 'ajv-formats';

const logger = getLogger({serviceName: 'schema-validator'});
const ajv = new AJV();
addFormats(ajv);

export type ValidationResult = {
  isValid: boolean;
  validationErrors: null | ErrorObject[];
};

export async function validate<DetailType>(
  validationSchema: Schema,
  detail: DetailType,
): Promise<ValidationResult> {
  const schemaFn = ajv.compile(validationSchema);
  const isDocumentValid = schemaFn(detail);

  if (isDocumentValid) {
    logger.debug(`[Valid] Data: ${JSON.stringify(detail)}`, {detail});
    return <ValidationResult>{isValid: true};
  }

  logger.warn(`[Invalid] Data: ${JSON.stringify(detail)}`, {
    detail,
    validationErrors: schemaFn.errors,
  });

  return <ValidationResult>{
    isValid: false,
    validationErrors: schemaFn.errors,
  };
}
