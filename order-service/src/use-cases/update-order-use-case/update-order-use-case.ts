import { Order } from '@models/order';
import { OrderDTO, UpdatedOrderDTO } from '@dto/order-dto';
import { getCustomerByIDDynamoDbAdapter } from '@adapters/secondary/get-customer-dynamo-db-adapter';
import { getOrderByIdDynamoDbAdapter } from '@adapters/secondary/get-order-dynamo-db-adapter';
import { getLogger } from '@shared/monitor';
import { updateOrderDynamoDbAdapter } from '@adapters/secondary/update-order-dynamo-db-adapter';

const logger = getLogger({ serviceName: 'updateOrderUseCase' });

/**
 * Update Order Use Case
 * @param id
 * @param orderDto
 * @returns OrderDto
 */
export async function updateOrderUseCase(
  id: string,
  updatedOrderDTO: UpdatedOrderDTO,
): Promise<OrderDTO> {
  try {
    const order = await getOrderByIdDynamoDbAdapter(id);

    // get all order lines that have been deleted
    const orderLinesToDelete =
      order.orderLines?.filter(
        orderLine =>
          !updatedOrderDTO.orderLines
            ?.map(line => line.id)
            .includes(orderLine.id),
      ) ?? [];

    // Update the create date time for all lines to match original creation time.
    updatedOrderDTO.orderLines = updatedOrderDTO.orderLines?.map(line => {
      return {
        ...line,
        createdDateTime: order.orderLines
          ?.filter(orderLine => orderLine.id === line.id)[0]
          ?.createdDateTime.toISOString(),
      };
    });
    const customer = await getCustomerByIDDynamoDbAdapter(
      updatedOrderDTO.customerId,
    );
    const updatedOrder = Order.fromDTO({
      ...updatedOrderDTO,
      id,
      createdDateTime: order.createdDateTime.toISOString(),
      customer: customer.toDTO(),
    } as OrderDTO);

    await updatedOrder.validate();

    // send updated order and the lines that need to be deleted to the secondary adapter.
    return (
      await updateOrderDynamoDbAdapter(updatedOrder, orderLinesToDelete)
    ).toDTO();
  } catch (err) {
    logger.error((err as Error).message, { updatedOrderDTO });
    throw err;
  }
}
