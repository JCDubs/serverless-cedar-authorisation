export type DynamoCustomerDTO = {
  PK: string;
  SK: string;
  id?: string;
  name: string;
  email: string;
  accountManager: string;
  createdDateTime?: string;
  updatedDateTime?: string;
  GSI1_PK: string;
  GSI1_SK: string;
  GSI2_PK: string;
  GSI2_SK: string;
  GSI3_PK: string;
  GSI3_SK: string;
};
