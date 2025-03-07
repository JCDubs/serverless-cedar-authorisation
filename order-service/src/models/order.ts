import { DynamoDBRecord, OrderStatus } from '../types';
import { NewOrderDTO, OrderDTO, OrderLineDTO } from '../dto/order-dto';
import { v4 as uuid } from 'uuid';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { orderSchema } from '@schemas/order-schema';
import { getLogger } from '@shared/monitor';
import { UserDetailService } from '@use-cases/user-details-service';
import { CustomerDTO } from '@dto/customer-dto';
import { DynamoOrderDTO, DynamoOrderLineDTO } from '@dto/dynamo-order-dto';
import { Customer } from './customer';
import { putMetric, metrics, validate } from '@shared/index';
import { OrderLineType, OrderType } from './order-types';
import { ValidationError } from '@errors/validation-error';

const ajv = new Ajv();
addFormats(ajv);
const logger = getLogger({ serviceName: 'OrderModel' });

export class OrderLine
  implements OrderLineType, DynamoDBRecord<DynamoOrderLineDTO> {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly price: number;
  readonly total: number;
  readonly createdDateTime: Date;
  readonly updatedDateTime: Date;

  constructor(orderId: string, orderLineDTO: OrderLineDTO) {
    this.id = orderLineDTO.id ?? uuid();
    this.orderId = orderId;
    this.productId = orderLineDTO.productId;
    this.productName = orderLineDTO.productName;
    this.quantity = orderLineDTO.quantity;
    this.price = orderLineDTO.price;
    this.total = orderLineDTO.total;
    this.createdDateTime = new Date(
      orderLineDTO.createdDateTime ?? new Date().toISOString(),
    );
    this.updatedDateTime = new Date(
      orderLineDTO.updatedDateTime ?? new Date().toISOString(),
    );
  }

  static fromDTO(orderId: string, orderLineDTO: OrderLineDTO): OrderLine {
    return new OrderLine(orderId, orderLineDTO);
  }

  toDTO(): OrderLineDTO {
    return {
      id: this.id,
      productId: this.productId,
      productName: this.productName,
      quantity: this.quantity,
      price: this.price,
      total: this.total,
      createdDateTime: this.createdDateTime.toISOString(),
      updatedDateTime: this.updatedDateTime.toISOString(),
    };
  }

  static fromDatabaseDTO(dynamoOrderLineDTO: DynamoOrderLineDTO): OrderLine {
    return new OrderLine(
      dynamoOrderLineDTO.orderId,
      {
        id: dynamoOrderLineDTO.id,
        productId: dynamoOrderLineDTO.productId,
        productName: dynamoOrderLineDTO.productName,
        quantity: dynamoOrderLineDTO.quantity,
        price: dynamoOrderLineDTO.price,
        total: dynamoOrderLineDTO.total,
        createdDateTime: dynamoOrderLineDTO.createdDateTime,
        updatedDateTime: dynamoOrderLineDTO.updatedDateTime,
      },
    );
  }

  toDatabaseDTO(): DynamoOrderLineDTO {
    return {
      PK: 'ORDER_LINE',
      SK: `ORDER_ID#${this.orderId}#LINE_ID#${this.id}`,
      ...this,
      createdDateTime: this.createdDateTime.toISOString(),
      updatedDateTime: this.updatedDateTime.toISOString(),
      GSI1_PK: 'PRODUCT_ID',
      GSI1_SK: this.productId,
      GSI2_PK: 'QUANTITY',
      GSI2_SK: `${this.quantity}`,
      GSI3_PK: 'PRICE',
      GSI3_SK: `${this.price}`,
    };
  }
}

export class Order implements OrderType, DynamoDBRecord<DynamoOrderDTO> {
  readonly id: string;
  readonly customer: Customer;
  readonly createdDateTime: Date;
  readonly updatedDateTime: Date;
  readonly createdBy: string;
  readonly status: OrderStatus;
  readonly totalAmount: number;
  readonly orderLines: OrderLine[];
  readonly branchId: string;
  readonly comments: string;

  private constructor(orderDTO: OrderDTO) {
    this.id = orderDTO.id;
    this.customer = Customer?.fromDTO(orderDTO.customer);
    this.createdDateTime = new Date(
      orderDTO.createdDateTime ?? new Date().toISOString(),
    );
    this.updatedDateTime = new Date(
      orderDTO.updatedDateTime ?? new Date().toISOString(),
    );
    this.createdBy = orderDTO.createdBy ?? UserDetailService.getUserName();
    this.status = (orderDTO.status as OrderStatus) ?? OrderStatus.PENDING;
    this.orderLines = (orderDTO.orderLines ?? []).map(orderLineDto =>
      OrderLine.fromDTO(this.id, orderLineDto),
    );
    this.branchId = orderDTO.branchId;
    this.comments = orderDTO.comments ?? '';
    this.totalAmount =
      orderDTO.totalAmount ??
      this.orderLines.reduce(
        (accumulator, orderLine) => accumulator + orderLine.total,
        0,
      );
  }

  async validate(): Promise<void> {
    try {
      const validationResult = await validate<OrderType>(orderSchema, this);

      if (!validationResult.isValid) {
        putMetric({
          metrics,
          metricName: 'InvalidOrder',
        });
        logger.error('Order is invalid', {
          order: this,
          validationErrors: validationResult.validationErrors,
        });
        throw new ValidationError('Order is invalid');
      }
    } catch (err) {
      const message = 'Could not validate the order';
      logger.error(message, {
        errors: (err as Error).message,
      });
      throw new ValidationError(message);
    }
  }

  toDTO(): OrderDTO {
    return {
      ...this,
      customer: this.customer.toDTO(),
      createdDateTime: this.createdDateTime.toISOString(),
      updatedDateTime: this.updatedDateTime.toISOString(),
      orderLines: this.orderLines?.map(line => line.toDTO()),
    };
  }

  toDatabaseDTO(): DynamoOrderDTO {
    return {
      PK: 'ORDER',
      SK: this.id,
      id: this.id,
      customerId: this.customer.id,
      customerName: this.customer.name,
      customerEmail: this.customer.email,
      customerAccountManager: this.customer.accountManager,
      createdDateTime: this.createdDateTime.toISOString(),
      updatedDateTime: this.updatedDateTime.toISOString(),
      createdBy: this.createdBy,
      status: this.status,
      totalAmount: this.totalAmount,
      branchId: this.branchId,
      comments: this.comments,
      GSI1_PK: 'CUSTOMER_ID',
      GSI1_SK: this.customer.id,
      GSI2_PK: 'CUSTOMER_ACCOUNT_MANAGER',
      GSI2_SK: this.customer.accountManager,
      GSI3_PK: 'CUSTOMER_EMAIL',
      GSI3_SK: this.customer.email,
      GSI4_PK: 'BRANCH',
      GSI4_SK: this.branchId,
      GSI5_PK: 'CREATED_BY',
      GSI5_SK: this.createdBy,
    };
  }

  static fromDTO(orderDTO: OrderDTO): Order {
    logger.debug('Converting DTO to order', { orderDTO });
    return new Order(orderDTO);
  }

  static fromNewOrderDTO(orderDTO: NewOrderDTO, customer: CustomerDTO): Order {
    logger.debug('Converting DTO to order', { orderDTO, customer });
    return new Order({
      id: uuid(),
      ...orderDTO,
      createdBy: UserDetailService.getUserName()!,
      customer,
    });
  }

  static fromDatabaseDTO(
    dynamoOrderDTO: DynamoOrderDTO,
  ): Order {
    return new Order({
      id: dynamoOrderDTO.id,
      customer: {
        id: dynamoOrderDTO.customerId,
        name: dynamoOrderDTO.customerName,
        email: dynamoOrderDTO.customerEmail,
        accountManager: dynamoOrderDTO.customerAccountManager,
      },
      createdDateTime: dynamoOrderDTO.createdDateTime,
      updatedDateTime: dynamoOrderDTO.updatedDateTime,
      createdBy: dynamoOrderDTO.createdBy,
      status: dynamoOrderDTO.status,
      totalAmount: dynamoOrderDTO.totalAmount,
      branchId: dynamoOrderDTO.branchId,
      comments: dynamoOrderDTO.comments,
    });
  }

  addOrderLines(orderLines: OrderLine[]): Order {
    this.orderLines.push(...orderLines);
    return this;
  }
}
