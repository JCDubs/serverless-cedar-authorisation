import {OrderStatus} from '../types';
import {CustomerDTO} from './customer-dto';

export type OrderLineDTO = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  createdDateTime?: string;
  updatedDateTime?: string;
};

export type OrderDTO = {
  id: string;
  customer: CustomerDTO;
  createdDateTime?: string;
  updatedDateTime?: string;
  createdBy: string;
  status?: OrderStatus;
  totalAmount?: number;
  branchId: string;
  comments?: string;
  orderLines?: OrderLineDTO[];
};

export type NewOrderLineDTO = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
};

export type NewOrderDTO = {
  customerId: string;
  status?: OrderStatus;
  totalAmount?: number;
  branchId: string;
  comments?: string;
  orderLines?: OrderLineDTO[];
};

export type UpdatedOrderLineDTO = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
};

export type UpdatedOrderDTO = {
  customerId: string;
  status: OrderStatus;
  branchId: string;
  comments?: string;
  orderLines?: OrderLineDTO[];
};

/**
 * Order Access Patterns
 *
 * * Get order by customer id and order id -> PK and SK
 * * Get order by customer id -> PK and SK begins with
 * * Get orders by accountManager -> GSI1
 * * Get orders by customer email -> GSI2
 * * Get orders by createdBy -> GSI3
 * * Get orders by branch -> GSI4
 *
 * Line Access Patterns
 *
 * * Get line by order id. -> PK & SK begins with.
 * * Get line by order id and line id. -> PK & SK.
 * * Get line by product id. -> GSI1
 * * Get line by quantity. -> GSI2
 * * Get line by price. -> GSI3
 *
 */
