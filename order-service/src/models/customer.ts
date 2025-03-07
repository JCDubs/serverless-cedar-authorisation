import { CustomerDTO } from '../dto/customer-dto';
import { v4 as uuid } from 'uuid';
import { getLogger } from '@shared/monitor';
import { customerSchema } from '@schemas/customer-schema';
import { DynamoCustomerDTO } from '@dto/dynamo-customer-dto';
import { putMetric, metrics, validate } from '@shared/index';
import { CustomerType } from './customer-types';
import { ValidationError } from '@errors/validation-error';

const logger = getLogger({ serviceName: 'CustomerModel' });

export class Customer implements CustomerType {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly accountManager: string;
  readonly createdDateTime: Date;
  readonly updatedDateTime: Date;

  constructor(customerDTO: CustomerDTO) {
    this.id = customerDTO.id ?? uuid();
    this.name = customerDTO.name;
    this.email = customerDTO.email;
    this.accountManager = customerDTO.accountManager;
    this.createdDateTime = new Date(
      customerDTO.createdDateTime ?? new Date().toISOString(),
    );
    this.updatedDateTime = new Date(
      customerDTO.updatedDateTime ?? new Date().toISOString(),
    );
  }

  static fromDTO(customerDTO: CustomerDTO): Customer {
    return new Customer(customerDTO);
  }

  toDTO(): CustomerDTO {
    return {
      ...this,
      createdDateTime: this.createdDateTime.toISOString(),
      updatedDateTime: this.updatedDateTime.toISOString(),
    };
  }

  async validate(): Promise<void> {
    try {
      const validationResult = await validate<CustomerType>(
        customerSchema,
        this,
      );

      if (!validationResult.isValid) {
        putMetric({
          metrics,
          metricName: 'InvalidOrder',
        });
        logger.error('Order is invalid', {
          order: this,
          validationErrors: validationResult.validationErrors,
        });
        throw new ValidationError('Customer is invalid');
      }
    } catch (err) {
      const message = 'Could not validate the Customer';
      logger.error(message, {
        errors: (err as Error).message,
      });
      throw new ValidationError(message);
    }
  }

  static fromDatabaseDTO(dynamoOrderDTO: DynamoCustomerDTO): Customer {
    return new Customer({
      id: dynamoOrderDTO.id,
      name: dynamoOrderDTO.name,
      email: dynamoOrderDTO.email,
      accountManager: dynamoOrderDTO.accountManager,
      createdDateTime: dynamoOrderDTO.createdDateTime,
      updatedDateTime: dynamoOrderDTO.updatedDateTime,
    });
  }

  toDatabaseDTO(): DynamoCustomerDTO {
    return {
      PK: 'CUSTOMER',
      SK: this.id,
      ...this,
      createdDateTime: this.createdDateTime.toISOString(),
      updatedDateTime: this.updatedDateTime.toISOString(),
      GSI1_PK: 'CUSTOMER_NAME',
      GSI1_SK: this.name,
      GSI2_PK: 'CUSTOMER_EMAIL',
      GSI2_SK: this.email,
      GSI3_PK: 'ACCOUNT_MANAGER',
      GSI3_SK: this.accountManager,
    };
  }
}
