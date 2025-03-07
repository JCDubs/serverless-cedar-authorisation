import {OrderStatus} from '../types';
import {Customer} from './customer';

export type OrderLineType = {
  readonly id: string;
  readonly orderId: string;
  readonly productId: string;
  readonly productName: string;
  readonly quantity: number;
  readonly price: number;
  readonly total: number;
  readonly createdDateTime: Date;
  readonly updatedDateTime: Date;
};

export type OrderType = {
  readonly id: string;
  readonly customer: Customer;
  readonly createdDateTime: Date;
  readonly updatedDateTime: Date;
  readonly createdBy: string;
  readonly status: OrderStatus;
  readonly totalAmount: number;
  orderLines?: OrderLineType[];
  readonly branchId: string;
  readonly comments: string;
};
