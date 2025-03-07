import {validate} from './schema-validator';
import {JSONSchemaType} from 'ajv';

const body = {
  firstName: 'Bart',
  surname: 'Simpson',
};

const schema: JSONSchemaType<{firstName: string; surname: string}> = {
  type: 'object',
  required: ['firstName', 'surname'],
  maxProperties: 2,
  minProperties: 2,
  properties: {
    firstName: {
      type: 'string',
      pattern: '^[a-zA-Z]+$',
    },
    surname: {
      type: 'string',
      pattern: '^[a-zA-Z]+$',
    },
  },
};

describe('schema-validator', () => {
  it('should validate a schema correctly', async () => {
    const validationResult = await validate(schema, body);
    expect(validationResult).toStrictEqual({
      isValid: true,
    });
  });

  it('should result in isValid false if the schema is invalid', async () => {
    const badBody = {
      ...body,
      firstName: null,
    };
    const validationResult = await validate(schema, badBody);
    expect(validationResult).toStrictEqual({
      isValid: false,
      validationErrors: [
        {
          instancePath: '/firstName',
          keyword: 'type',
          message: 'must be string',
          params: {
            type: 'string',
          },
          schemaPath: '#/properties/firstName/type',
        },
      ],
    });
  });
});
