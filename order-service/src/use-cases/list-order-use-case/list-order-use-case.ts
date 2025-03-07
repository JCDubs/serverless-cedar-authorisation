import {PaginationParams, ListItems, getLogger} from '@shared/index';
import {Order} from '@models/order';
import {OrderDTO} from '@dto/order-dto';
import {listOrderDynamoDbAdapter} from '@adapters/secondary/list-order-dynamo-db-adapter';

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
    const orderList: ListItems<Order, string> =
      await listOrderDynamoDbAdapter(paginationParams);
    logger.info('Returning Order list', {orderList});

    return {
      offset: orderList.offset,
      items: orderList.items.map(order => order.toDTO() as OrderDTO),
    };
  } catch (error) {
    logger.error('Error occurred during order retrieval', {error});
    throw error;
  }
}
