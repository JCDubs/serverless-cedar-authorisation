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

describe('Customer role tests', () => {
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

  it('Customer can get their own orders created by someone else', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.GET_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Customer can get their own orders created by them', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.GET_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Customer cant get other customers orders', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.GET_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: 'customer-2',
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Customer can list their own orders created by someone else', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.LIST_ORDERS)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: 'test-1',
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Customer can list their own orders created by them', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.LIST_ORDERS)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Customer cant list other customers orders', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.LIST_ORDERS)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: 'customer-2',
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Customer can create their own orders created by them', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.CREATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Customer cant create an order for other customers', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.CREATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: 'customer-two',
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Customer can update their own orders if the status is PENDING', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.UPDATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Customer cant update their own orders if the status is SHIPPED', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.UPDATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.SHIPPED,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Customer cant update their own orders if the status is DELIVERED', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.UPDATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.DELIVERED,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Customer cant update other customers orders', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.UPDATE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: 'customer-two',
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Customer can delete their own orders if the status is PENDING', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.DELETE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeTruthy();
  });

  it('Customer cant delete their own orders if the status is SHIPPED', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.DELETE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.SHIPPED,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Customer cant delete their own orders if the status is DELIVERED', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.DELETE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: userName,
          accountManager: 'account manager 1',
          status: Status.DELIVERED,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });

  it('Customer cant delete other customers orders', async () => {
    const orderId = uuid();
    const userName = 'customer-one';
    jest.spyOn(UserDetailService, 'getUserName').mockReturnValue(userName);
    jest.spyOn(UserDetailService, 'getRoles').mockReturnValue([Role.CUSTOMER, Role.USER]);
    authService = await AuthorizationService.getService(authorizationConfig, serviceConfig, true);
    const authResult = authService
      .setAction(OrderAction.DELETE_ORDER)
      .setResource(orderId)
      .addEntity(
        createOrderEntity({
          id: orderId,
          createdBy: userName,
          customer: 'customer-two',
          accountManager: 'account manager 1',
          status: Status.PENDING,
        })
      )
      .isAuthorized();

    expect(authResult).toBeFalsy();
  });
});
