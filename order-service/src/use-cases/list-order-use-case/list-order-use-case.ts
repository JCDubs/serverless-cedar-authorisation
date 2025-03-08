import {PaginationParams, ListItems, getLogger} from '@shared/index';
import {Order} from '@models/order';
import {OrderDTO} from '@dto/order-dto';
import { listOrderByAccountManagerDynamoDbAdapter } from '@adapters/secondary/list-order-by-account-manager-dynamo-db-adapter';
import { listOrderByCustomerDynamoDbAdapter } from '@adapters/secondary/list-order-by-customer-dynamo-db-adapter';
import {listOrderDynamoDbAdapter} from '@adapters/secondary/list-order-dynamo-db-adapter';
import { UserDetailService } from 'common-sdk';
import { authoriseRequest } from '@adapters/secondary/authorisation-adapter';
import { OrderAuthAction } from '../../types';

const logger = getLogger({serviceName: 'listOrderUseCase'})

/**
 * List Order use case.
 * @param paginationParams
 * @returns Promise<ListItems<OrderDto, {PK: string}>
 */
export async function listOrderUseCase(
  paginationParams: PaginationParams,
): Promise<ListItems<OrderDTO, string>> {
  try {
    logger.debug("Retrieving list of order'", paginationParams);
    let orderList: ListItems<Order, string>;
    const userName = UserDetailService.getUserName();
    const roles = UserDetailService.getRoles();

    if (!userName) {
      throw new Error('User not found');
    }

    if (roles?.includes('customers')) {
      orderList = await listOrderByCustomerDynamoDbAdapter(userName, paginationParams);
    } else if (roles?.includes('accountManagers')) {
      orderList = await listOrderByAccountManagerDynamoDbAdapter(userName, paginationParams);
    } else {
      orderList = await listOrderDynamoDbAdapter(paginationParams);
    }

    for (let order of orderList.items){
      await authoriseRequest(OrderAuthAction.LIST_ORDERS, order);
    }

    return {
      offset: orderList.offset,
      items: orderList.items.map(order => order.toDTO() as OrderDTO),
    };
  } catch (error) {
    logger.error('Error occurred during order retrieval', {error});
    throw error;
  }
}
