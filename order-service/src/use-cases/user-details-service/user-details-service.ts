import { APIGatewayProxyEvent } from 'aws-lambda';
import { getLogger } from '@shared/monitor';

const logger = getLogger({ serviceName: 'user-detail-service' });

/**
 * UserDetailService retrieves the AWS Cognito users details from
 * a request event, consisting of the user name and roles, and makes
 * them available to the application for use.
 */
export class UserDetailService {
  static userName?: string;
  static roles?: string[];

  /**
   * Set the user details from the event.
   * @param authenticatedEvent The request event containing the authentication details.
   */
  static setUserDetails(authenticatedEvent: APIGatewayProxyEvent) {
    if (!authenticatedEvent.requestContext.authorizer) {
      logger.warn('The event is not an authenticated request.');
      return;
    }
    logger.debug('Getting user name...');
    this.userName =
      authenticatedEvent.requestContext.authorizer.claims['cognito:username'];
    logger.debug('User name set.', { userName: this.userName });
    if (
      typeof authenticatedEvent.requestContext.authorizer.claims[
      'cognito:groups'
      ] === 'string'
    ) {
      this.roles = [];
      this.roles.push(
        authenticatedEvent.requestContext.authorizer.claims['cognito:groups'],
      );
    } else {
      this.roles =
        authenticatedEvent.requestContext.authorizer.claims['cognito:groups'];
    }
    logger.debug('User details set', {
      userName: this.userName,
      roles: this.roles,
    });
  }

  /**
   * The user name of the authenticated user.
   * @returns Logged in user's user name.
   */
  static getUserName(): string | undefined {
    return this.userName;
  }

  /**
   * Get the roles of the authenticated user.
   * @returns Logged in user's roles.
   */
  static getRoles(): string[] | undefined {
    return this.roles;
  }

  /**
   * Reset the user details.
   */
  static resetDetails() {
    this.userName = undefined;
    this.roles = undefined;
  }
}
