import { S3Client } from '../../S3';
import { AuthorizationService } from '../authorization-service';
import { UserDetailService } from '../../user-details';
import { v4 as uuid } from 'uuid';
import { authorizationConfig, serviceConfig } from './config';
import { createOrderEntity } from './create-order-entity';
import { OrderAction, Role, Status } from './types';
import { getPolicy, getSchema } from './get-policy';

let policy: string;
let schema: string;

describe('Account Manager role tests', () => {
  let authService: AuthorizationService;

  beforeAll(() => {
    policy = getPolicy();
    schema = getSchema();
  });

  beforeEach(async () => {
    const s3Mock = jest.spyOn(S3Client.prototype, 'getObject');
    s3Mock.mockResolvedValueOnce(policy).mockResolvedValueOnce(schema);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('Account Managers can get orders for customer accounts they manage', async () => {
    const orderId = uuid();
    const userName = 'account-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.ACCOUNT_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.GET_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-1',
          accountManager: 'account-manager-one',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Account Managers can list orders for customer accounts they manage', async () => {
    const orderId = uuid();
    const userName = 'account-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.ACCOUNT_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.LIST_ORDERS)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-1',
          accountManager: 'account-manager-one',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Account Managers cant get an order for any customer they do not manage', async () => {
    const orderId = uuid();
    const userName = 'account-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.ACCOUNT_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.GET_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-1',
          accountManager: 'account-manager-two',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Account Managers cant list orders for any customers they do not manage', async () => {
    const orderId = uuid();
    const userName = 'account-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.ACCOUNT_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.LIST_ORDERS)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-1',
          accountManager: 'account-manager-two',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Account Managers cant create orders', async () => {
    const orderId = uuid();
    const userName = 'account-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.ACCOUNT_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.CREATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-2',
          accountManager: 'account-manager-one',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Account Managers cant update orders', async () => {
    const orderId = uuid();
    const userName = 'account-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.ACCOUNT_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.UPDATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-2',
          accountManager: 'account-manager-one',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Account Managers cant delete orders', async () => {
    const orderId = uuid();
    const userName = 'account-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.ACCOUNT_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.DELETE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-2',
          accountManager: 'account-manager-one',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });
});
