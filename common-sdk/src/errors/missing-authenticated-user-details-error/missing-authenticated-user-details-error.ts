export class MissingAuthenticatedUserDetailsError extends Error {
  constructor() {
    super('Missing authenticated user details');
    this.name = 'MissingAuthenticatedUserDetailsError';
  }
}
