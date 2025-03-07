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
