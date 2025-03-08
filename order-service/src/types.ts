export enum OrderStatus {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export type PaginationParams = {offset?: string; limit?: number};

export interface ListItems<T> {
  items: T[];
  offset?: string;
}

export type UserDetails = {
  email: string;
  roles: string[];
};

export interface DynamoDBRecord<T extends DynamoDBItem> {
  toDatabaseDTO(): T;
}

export interface DynamoDBItem {
  PK: string;
  SK: string;
}

export enum OrderAuthAction {
  CREATE_ORDER = 'createOrder',
  GET_ORDER = 'getOrder',
  UPDATE_ORDER = 'updateOrder',
  DELETE_ORDER = 'deleteOrder',
  LIST_ORDERS = 'listOrders',
}

export enum ORDER_GSI {
  CUSTOMER_ID = 'GSI1',
  CUSTOMER_ACCOUNT_MANAGER = 'GSI2',
  CUSTOMER_EMAIL = 'GSI3',
  BRANCH = 'GSI4',
  CREATED_BY = 'GSI5',
}
