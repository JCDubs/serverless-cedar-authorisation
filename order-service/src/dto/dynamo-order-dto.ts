import {DynamoDBItem, OrderStatus} from '../types';

export interface DynamoOrderLineDTO extends DynamoDBItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
  createdDateTime?: string;
  updatedDateTime?: string;
  GSI1_PK: string;
  GSI1_SK: string;
  GSI2_PK: string;
  GSI2_SK: string;
  GSI3_PK: string;
  GSI3_SK: string;
}

export interface DynamoOrderDTO extends DynamoDBItem {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerAccountManager: string;
  createdDateTime?: string;
  updatedDateTime?: string;
  createdBy: string;
  status?: OrderStatus;
  totalAmount?: number;
  branchId: string;
  comments?: string;
  GSI1_PK: string;
  GSI1_SK: string;
  GSI2_PK: string;
  GSI2_SK: string;
  GSI3_PK: string;
  GSI3_SK: string;
  GSI4_PK: string;
  GSI4_SK: string;
  GSI5_PK: string;
  GSI5_SK: string;
}
