import { S3Client } from '../S3';
import * as fs from 'fs';
import * as path from 'path';
import { AuthorizationService } from './authorization-service';
import { AuthorizationConfigType, ServiceConfig } from './types';
import { UserDetailService } from '../user-details';

let policy: string;
let schema: string;
const authorizationConfig: AuthorizationConfigType = {
  namespace: 'OrderService::',
  principleType: 'User',
  resourceType: 'Order',
  roleType: 'Role',
};
const serviceConfig: ServiceConfig = {
  serviceName: 'Test-Service',
  organisationName: 'Test-Organisation',
};

describe('Authorization Service tests', () => {
  beforeAll(() => {
    policy = fs.readFileSync(
      path.resolve(__dirname, './authorization-tests/cedar/policies.cedar'),
      'utf-8'
    );
    schema = fs.readFileSync(
      path.resolve(__dirname, './authorization-tests/cedar/schema.cedarschema'),
      'utf-8'
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Policy and Schema S3 Client tests', () => {
    it('Policy and schema are returned successfully', async () => {
      const s3Mock = jest.spyOn(S3Client.prototype, 'getObject');
      s3Mock.mockResolvedValueOnce(policy).mockResolvedValueOnce(schema);
      const authorizationService = await AuthorizationService.getService(
        authorizationConfig,
        serviceConfig,
        true
      );
      expect(s3Mock).toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/policies.cedar',
        'gb-dev-city-auth-policy-store'
      );
      expect(s3Mock).toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/schema.cedarschema',
        'gb-dev-city-auth-policy-store'
      );
      expect(authorizationService).not.toBeUndefined();
    });

    it('Policy is not returned successfully', async () => {
      const s3Mock = jest.spyOn(S3Client.prototype, 'getObject');
      s3Mock.mockRejectedValueOnce(new Error('Test Error')).mockResolvedValueOnce(schema);
      await expect(
        AuthorizationService.getService(authorizationConfig, serviceConfig, true)
      ).rejects.toThrow('Missing authorization policy details');
      expect(s3Mock).toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/policies.cedar',
        'gb-dev-city-auth-policy-store'
      );
      expect(s3Mock).not.toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/schema.cedarschema',
        'gb-dev-city-auth-policy-store'
      );
    });

    it('Schema is not returned successfully', async () => {
      const s3Mock = jest.spyOn(S3Client.prototype, 'getObject');
      s3Mock.mockResolvedValueOnce(policy).mockRejectedValueOnce(new Error('Test Error'));
      await expect(
        AuthorizationService.getService(authorizationConfig, serviceConfig, true)
      ).rejects.toThrow('Missing authorization schema details');
      expect(s3Mock).toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/policies.cedar',
        'gb-dev-city-auth-policy-store'
      );
      expect(s3Mock).toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/schema.cedarschema',
        'gb-dev-city-auth-policy-store'
      );
    });

    it('Empty policy is returned', async () => {
      const s3Mock = jest.spyOn(S3Client.prototype, 'getObject');
      s3Mock.mockResolvedValueOnce(undefined).mockResolvedValueOnce(schema);
      await expect(
        AuthorizationService.getService(authorizationConfig, serviceConfig, true)
      ).rejects.toThrow('Missing authorization policy details');
      expect(s3Mock).toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/policies.cedar',
        'gb-dev-city-auth-policy-store'
      );
      expect(s3Mock).toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/schema.cedarschema',
        'gb-dev-city-auth-policy-store'
      );
    });

    it('Empty schema is returned', async () => {
      const s3Mock = jest.spyOn(S3Client.prototype, 'getObject');
      s3Mock.mockResolvedValueOnce(policy).mockResolvedValueOnce(undefined);
      await expect(
        AuthorizationService.getService(authorizationConfig, serviceConfig, true)
      ).rejects.toThrow('Missing authorization schema details');
      expect(s3Mock).toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/policies.cedar',
        'gb-dev-city-auth-policy-store'
      );
      expect(s3Mock).toHaveBeenCalledWith(
        'gb/common-components/Test-Service/policy/schema.cedarschema',
        'gb-dev-city-auth-policy-store'
      );
    });
  });

  describe('AuthorizationProperties validation tests', () => {
    let authService: AuthorizationService;
    beforeEach(async () => {
      const s3Mock = jest.spyOn(S3Client.prototype, 'getObject');
      s3Mock.mockResolvedValueOnce(policy).mockResolvedValueOnce(schema);
      authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    });

    it('Authorization request is missing user name', () => {
      let errorMessage = '';
      try {
        authService.isAuthorized();
      } catch (err) {
        errorMessage = (err as Error).message;
      }
      expect(errorMessage).toEqual('Missing authenticated user details');
    });

    it('Authorization request is missing user roles', () => {
      let errorMessage = '';
      try {
        jest.spyOn(UserDetailService, 'getUserName').mockReturnValue('Test User');
        authService.isAuthorized();
      } catch (err) {
        errorMessage = (err as Error).message;
      }
      expect(errorMessage).toEqual('Missing authenticated user details');
    });

    it('Authorization request is missing action', () => {
      let errorMessage = '';
      try {
        jest.spyOn(UserDetailService, 'getUserName').mockReturnValue('Test User');
        jest.spyOn(UserDetailService, 'getRoles').mockReturnValue(['user', 'admin']);
        authService.isAuthorized();
      } catch (err) {
        errorMessage = (err as Error).message;
      }
      expect(errorMessage).toEqual('Missing authorization action details');
    });

    it('Authorization request is missing resource', () => {
      let errorMessage = '';
      try {
        jest.spyOn(UserDetailService, 'getUserName').mockReturnValue('Test User');
        jest.spyOn(UserDetailService, 'getRoles').mockReturnValue(['user', 'admin']);
        authService.setAction('getOrder');
        authService.isAuthorized();
      } catch (err) {
        errorMessage = (err as Error).message;
      }
      expect(errorMessage).toEqual('Missing authorization resource details');
    });
  });
});
