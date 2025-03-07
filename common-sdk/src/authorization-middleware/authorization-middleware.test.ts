import { loadCedarAuthorization } from './authorization-middleware';
import { UserDetailService } from '../user-details';
import {
  AuthorizationConfigType,
  AuthorizationService,
  ServiceConfig,
} from '../authorization-service';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import middy from '@middy/core';

describe('authorization Middleware tests', () => {
  let beforeFn: middy.MiddlewareFn<APIGatewayProxyEvent, APIGatewayProxyResult>;

  const authorizationConfig: AuthorizationConfigType = {
    principleType: 'User',
    resourceType: 'Order',
    roleType: 'Role',
  };
  const serviceConfig: ServiceConfig = {
    serviceName: 'Test-Service',
    organisationName: 'Test-Organisation',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    beforeFn = loadCedarAuthorization(authorizationConfig, serviceConfig).before!;
  });

  it('should successfully setup the user and authorization service without headers', async () => {
    const request = {
      event: {
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': ['admin'],
            },
          },
        },
      },
    } as unknown as middy.Request<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context>;
    const userDetailsServiceSpy = jest
      .spyOn(UserDetailService, 'setUserDetails')
      .mockImplementation(() => true);
    const authorizationServiceSpy = jest
      .spyOn(AuthorizationService, 'getService')
      .mockImplementation(() => Promise.resolve({} as AuthorizationService));

    await expect(beforeFn(request)).resolves.not.toThrow();
    expect(userDetailsServiceSpy).toHaveBeenCalledWith(request.event);
    expect(authorizationServiceSpy).toHaveBeenCalledWith(authorizationConfig, serviceConfig, false);
  });

  it('should successfully setup the user and authorization service with headers', async () => {
    const request = {
      event: {
        headers: {},
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': ['admin'],
            },
          },
        },
      },
    } as unknown as middy.Request<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context>;
    const userDetailsServiceSpy = jest
      .spyOn(UserDetailService, 'setUserDetails')
      .mockImplementation(() => true);
    const authorizationServiceSpy = jest
      .spyOn(AuthorizationService, 'getService')
      .mockImplementation(() => Promise.resolve({} as AuthorizationService));

    await expect(beforeFn(request)).resolves.not.toThrow();
    expect(userDetailsServiceSpy).toHaveBeenCalledWith(request.event);
    expect(authorizationServiceSpy).toHaveBeenCalledWith(authorizationConfig, serviceConfig, false);
  });

  it('should successfully setup the user and authorization service with false cedar-refresh headers', async () => {
    const request = {
      event: {
        headers: { 'cedar-refresh': 'false' },
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': ['admin'],
            },
          },
        },
      },
    } as unknown as middy.Request<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context>;
    const userDetailsServiceSpy = jest
      .spyOn(UserDetailService, 'setUserDetails')
      .mockImplementation(() => true);
    const authorizationServiceSpy = jest
      .spyOn(AuthorizationService, 'getService')
      .mockImplementation(() => Promise.resolve({} as AuthorizationService));

    await expect(beforeFn(request)).resolves.not.toThrow();
    expect(userDetailsServiceSpy).toHaveBeenCalledWith(request.event);
    expect(authorizationServiceSpy).toHaveBeenCalledWith(authorizationConfig, serviceConfig, false);
  });

  it('should successfully setup the user and authorization service with true cedar-refresh headers', async () => {
    const request = {
      event: {
        headers: { 'cedar-refresh': 'true' },
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': ['admin'],
            },
          },
        },
      },
    } as unknown as middy.Request<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context>;
    const userDetailsServiceSpy = jest
      .spyOn(UserDetailService, 'setUserDetails')
      .mockImplementation(() => true);
    const authorizationServiceSpy = jest
      .spyOn(AuthorizationService, 'getService')
      .mockImplementation(() => Promise.resolve({} as AuthorizationService));

    await expect(beforeFn(request)).resolves.not.toThrow();
    expect(userDetailsServiceSpy).toHaveBeenCalledWith(request.event);
    expect(authorizationServiceSpy).toHaveBeenCalledWith(authorizationConfig, serviceConfig, true);
  });

  it('should throw an error', async () => {
    const request = {
      event: {
        headers: {},
        requestContext: {
          authorizer: {
            claims: {
              'cognito:username': 'testUser',
              'cognito:groups': ['admin'],
            },
          },
        },
      },
    } as unknown as middy.Request<APIGatewayProxyEvent, APIGatewayProxyResult, Error, Context>;
    const userDetailsServiceSpy = jest
      .spyOn(UserDetailService, 'setUserDetails')
      .mockImplementation(() => true);
    const authorizationServiceSpy = jest
      .spyOn(AuthorizationService, 'getService')
      .mockImplementation(() => Promise.reject(new Error('Test Error')));

    await expect(beforeFn(request)).rejects.toThrow('Test Error');
    expect(userDetailsServiceSpy).toHaveBeenCalledWith(request.event);
    expect(authorizationServiceSpy).toHaveBeenCalledWith(authorizationConfig, serviceConfig, false);
  });
});
