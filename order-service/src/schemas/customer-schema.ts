const customerSchema = {
  type: 'object',
  properties: {
    id: {type: 'string'},
    name: {type: 'string'},
    email: {type: 'string'},
    accountManager: {type: 'string'},
    createdDateTime: {type: 'object', format: 'date-time'},
    updatedDateTime: {type: 'object', format: 'date-time'},
  },
  required: [
    'id',
    'name',
    'email',
    'accountManager',
  ],
  additionalProperties: false,
};

export {customerSchema};
