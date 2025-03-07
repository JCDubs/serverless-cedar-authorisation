import {APIGatewayProxyEvent} from 'aws-lambda';
import {UserDetailService} from './user-details-service';

describe('UserDetailService', () => {
  beforeEach(() => {
    // Reset the service before each test
    UserDetailService.resetDetails();
  });

  describe('setUserDetails', () => {
    it('should set user details when event has valid authorizer with single role', () => {
      const mockEvent = {
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': 'admin',
            },
          },
        },
      } as unknown as APIGatewayProxyEvent;

      UserDetailService.setUserDetails(mockEvent);

      expect(UserDetailService.getUserName()).toBe('testUser');
      expect(UserDetailService.getRoles()).toEqual(['admin']);
    });

    it('should set user details when event has valid authorizer with multiple roles', () => {
      const mockEvent = {
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': ['admin', 'user'],
            },
          },
        },
      } as unknown as APIGatewayProxyEvent;

      UserDetailService.setUserDetails(mockEvent);

      expect(UserDetailService.getUserName()).toBe('testUser');
      expect(UserDetailService.getRoles()).toEqual(['admin', 'user']);
    });

    it('should handle event without authorizer', () => {
      const mockEvent = {
        requestContext: {},
      } as unknown as APIGatewayProxyEvent;

      UserDetailService.setUserDetails(mockEvent);

      expect(UserDetailService.getUserName()).toBeUndefined();
      expect(UserDetailService.getRoles()).toBeUndefined();
    });

    it('should handle event with empty claims', () => {
      const mockEvent = {
        requestContext: {
          authorizer: {
            claims: {},
          },
        },
      } as unknown as APIGatewayProxyEvent;

      UserDetailService.setUserDetails(mockEvent);

      expect(UserDetailService.getUserName()).toBeUndefined();
      expect(UserDetailService.getRoles()).toBeUndefined();
    });
  });

  describe('getUserName', () => {
    it('should return undefined when username is not set', () => {
      expect(UserDetailService.getUserName()).toBeUndefined();
    });

    it('should return username when set', () => {
      const mockEvent = {
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': ['admin'],
            },
          },
        },
      } as unknown as APIGatewayProxyEvent;

      UserDetailService.setUserDetails(mockEvent);
      expect(UserDetailService.getUserName()).toBe('testUser');
    });
  });

  describe('getRoles', () => {
    it('should return undefined when roles are not set', () => {
      expect(UserDetailService.getRoles()).toBeUndefined();
    });

    it('should return roles when set', () => {
      const mockEvent = {
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': ['admin', 'user'],
            },
          },
        },
      } as unknown as APIGatewayProxyEvent;

      UserDetailService.setUserDetails(mockEvent);
      expect(UserDetailService.getRoles()).toEqual(['admin', 'user']);
    });
  });

  describe('resetDetails', () => {
    it('should reset all user details', () => {
      const mockEvent = {
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': ['admin'],
            },
          },
        },
      } as unknown as APIGatewayProxyEvent;

      UserDetailService.setUserDetails(mockEvent);
      expect(UserDetailService.getUserName()).toBe('testUser');
      expect(UserDetailService.getRoles()).toEqual(['admin']);

      UserDetailService.resetDetails();
      expect(UserDetailService.getUserName()).toBeUndefined();
      expect(UserDetailService.getRoles()).toBeUndefined();
    });
  });
});
