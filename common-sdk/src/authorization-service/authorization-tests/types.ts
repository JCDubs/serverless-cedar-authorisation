export type OrderEntityProps = {
  id: string;
  createdBy: string;
  customer: string;
  accountManager: string;
  status: string;
};

export enum OrderAction {
  GET_ORDER = 'getOrder',
  CREATE_ORDER = 'createOrder',
  UPDATE_ORDER = 'updateOrder',
  DELETE_ORDER = 'deleteOrder',
  LIST_ORDERS = 'listOrders',
}

export enum Role {
  CUSTOMER = 'customers',
  SALE_STAFF = 'saleStaff',
  SALE_MANAGERS = 'saleManagers',
  ACCOUNT_MANAGERS = 'accountManagers',
  ACCOUNTANTS = 'accountants',
  USER = 'users',
}

export enum Status {
  PENDING = 'PENDING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
}
