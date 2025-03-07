import { putMetric, metrics } from '@shared/index';
import { Order } from '@models/order';
import { OrderDTO, NewOrderDTO } from '@dto/order-dto';
import { createOrderDynamoDbAdapter } from '@adapters/secondary/create-order-dynamo-db-adapter';
import { getCustomerByIDDynamoDbAdapter } from '@adapters/secondary/get-customer-dynamo-db-adapter';
import { getLogger } from '@shared/monitor';

const logger = getLogger({ serviceName: 'createOrderUseCase' });

/**
 * Use case for creating a new order.
 * @param newOrderDto
 * @returns Promise<OrderDto>
 */
export async function createOrderUseCase(
  newOrderDto: NewOrderDTO,
): Promise<OrderDTO> {
  try {
    const customer = await getCustomerByIDDynamoDbAdapter(
      newOrderDto.customerId,
    );
    const newOrder = Order.fromNewOrderDTO(newOrderDto, customer.toDTO());
    logger.debug('Converted newOrderDto into order', { newOrderDto, newOrder });
    await newOrder.validate();
    const createdOrder = await createOrderDynamoDbAdapter(newOrder);
    logger.info('Created order', { createdOrder });

    putMetric({
      metrics,
      metricName: 'OrderCreated',
    });
    return createdOrder.toDTO();
  } catch (error) {
    logger.error('Error creating order', { error });
    throw error;
  }
}
