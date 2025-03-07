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

describe('Sales Manager role tests', () => {
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

  it('Sale Managers can get orders belonging to any customer', async () => {
    const orderId = uuid();
    const userName = 'sales-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.SALE_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.GET_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-1',
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Sale Managers can create an order for any customer', async () => {
    const orderId = uuid();
    const userName = 'sales-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.SALE_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.CREATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-1',
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Sale Managers can update an order belonging to any customers with a status of pending', async () => {
    const orderId = uuid();
    const userName = 'sales-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.SALE_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.UPDATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-2',
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Sale Managers cant update an order for any customers with a status of shipped', async () => {
    const orderId = uuid();
    const userName = 'sales-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.SALE_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.UPDATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-2',
          accountManager: 'account manager 1',
          status: Status.SHIPPED,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Sale Managers cant update an order for any customers with a status of delivered', async () => {
    const orderId = uuid();
    const userName = 'sales-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.SALE_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.UPDATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-2',
          accountManager: 'account manager 1',
          status: Status.DELIVERED,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Sale Managers can delete an order belonging to any customers with a status of pending', async () => {
    const orderId = uuid();
    const userName = 'sales-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.SALE_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.DELETE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-2',
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Sale Managers cant delete an order for any customers with a status of shipped', async () => {
    const orderId = uuid();
    const userName = 'sales-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.SALE_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.DELETE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-2',
          accountManager: 'account manager 1',
          status: Status.SHIPPED,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Sale Managers cant delete an order for any customers with a status of delivered', async () => {
    const orderId = uuid();
    const userName = 'sales-manager-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.SALE_MANAGERS, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.DELETE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: 'customer-2',
          accountManager: 'account manager 1',
          status: Status.DELIVERED,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });
});
