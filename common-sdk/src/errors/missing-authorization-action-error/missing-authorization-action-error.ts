export class MissingAuthorizationActionError extends Error {
  constructor() {
    super('Missing authorization action details');
    this.name = 'MissingAuthorizationActionError';
  }
}
