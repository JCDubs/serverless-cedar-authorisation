export class MissingAuthorizationPolicyError extends Error {
  constructor() {
    super('Missing authorization policy details');
    this.name = 'MissingAuthorizationPolicyError';
  }
}
