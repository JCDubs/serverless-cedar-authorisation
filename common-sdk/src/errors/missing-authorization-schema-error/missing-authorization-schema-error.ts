export class MissingAuthorizationSchemaError extends Error {
  constructor() {
    super('Missing authorization schema details');
    this.name = 'MissingAuthorizationSchemaError';
  }
}
