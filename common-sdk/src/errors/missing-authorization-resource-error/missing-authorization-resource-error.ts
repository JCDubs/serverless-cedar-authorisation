export class MissingAuthorizationResourceError extends Error {
  constructor() {
    super('Missing authorization resource details');
    this.name = 'MissingAuthorizationResourceError';
  }
}
