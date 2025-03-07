# Order Service

## Introduction

This project is a serverless Order Service API built using AWS CDK and following clean architecture principles. It provides a complete set of CRUD operations for managing orders with proper authentication and authorization via AWS Cognito.

## Architecture

The service follows a hexagonal (ports and adapters) architecture with clear separation of concerns:

- **Primary Adapters**: Handle incoming requests (API Gateway + Lambda)
- **Use Cases**: Contain the business logic
- **Secondary Adapters**: Handle outgoing requests (DynamoDB)

The infrastructure is deployed as three separate CloudFormation stacks:
- `auth`: Contains Cognito User Pool and Identity Pool
- `stateful`: Contains DynamoDB tables and other stateful resources
- `stateless`: Contains API Gateway, Lambda functions, and other stateless resources

### Technologies Used

- **AWS CDK**: Infrastructure as Code
- **AWS Lambda**: Serverless compute
- **AWS API Gateway**: REST API endpoints
- **AWS DynamoDB**: NoSQL database with single-table design
- **AWS Cognito**: Authentication and authorization
- **Node.js**: Runtime environment
- **TypeScript**: Programming language
- **Lambda Powertools**: Logging, metrics, and tracing
- **Middy**: Middleware for Lambda handlers

## Project Structure

```
order-service/
├── infra/                  # CDK infrastructure code
│   ├── bin/                # CDK app entry point
│   ├── lib/                # CDK stacks
│   │   ├── stacks/
│   │       ├── auth/       # Authentication stack
│   │       ├── stateful/   # Database stack
│   │       ├── stateless/  # API and Lambda stack
├── src/                    # Application code
│   ├── adapters/           # Ports and adapters
│   │   ├── primary/        # Inbound adapters (API handlers)
│   │   ├── secondary/      # Outbound adapters (DynamoDB)
│   ├── use-cases/          # Business logic
│   ├── models/             # Domain models
│   ├── dto/                # Data Transfer Objects
│   ├── schemas/            # Validation schemas
│   ├── shared/             # Shared utilities
│   ├── config/             # Configuration
│   ├── constants/          # Constants
│   ├── errors/             # Error handling
├── scripts/                # Utility scripts
├── test/                   # Tests
```

## Prerequisites

- Node.js (version specified in `.nvmrc`)
- AWS CLI configured with appropriate credentials
- AWS CDK CLI installed globally

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```
4. Run tests:
   ```bash
   npm test
   ```

## Deployment

The Order API can be deployed to an AWS account using the CDK deploy command:

```bash
# Bootstrap CDK (first time only)
npx cdk bootstrap

# Deploy all stacks
npx cdk deploy --all
```

This will create the `auth`, `stateful`, and `stateless` CloudFormation stacks. The API will then be available through the auto-generated, public API Gateway URL.

To deploy a specific stack:

```bash
npx cdk deploy OrderServiceAuthStack
npx cdk deploy OrderServiceStatefulStack
npx cdk deploy OrderServiceStatelessStack
```

## Data Initialization

The project contains utility scripts to initialize the database and user pool after deployment.

### Order and Customer Data Initialization

The `scripts/hydrate.js` script inserts sample order and customer data into the DynamoDB table:

```bash
node scripts/hydrate.js
```

This script inserts two customers and several orders with static IDs that are referenced in the included Postman tests.

### User and Group Data Initialization

The `scripts/create-users.js` script populates the Cognito user pool with sample users and groups:

1. Edit the script to replace `{USER_POOL_ID}` with the ID of your deployed Cognito user pool
2. Run the script:
   ```bash
   node scripts/create-users.js
   ```

This creates all the possible users and roles that can use the Order REST API.

## Using the API

### Authentication

The API requires authentication via AWS Cognito. Login utility scripts are provided in the `scripts/login` directory for each test user:

1. Edit the login scripts to replace `{CLIENT_ID}` with the ID of your deployed Cognito user pool client
2. Run a login script for the desired user:
   ```bash
   ./scripts/login/michael.sh
   ```
3. The script will output an ID token that can be used in the `Authorization` header for API requests

### API Endpoints

The service provides the following endpoints:

- `GET /orders` - List all orders (filtered by user permissions)
- `GET /orders/{id}` - Get a specific order
- `POST /orders` - Create a new order
- `PUT /orders/{id}` - Update an existing order
- `DELETE /orders/{id}` - Delete an order

### Testing with Postman

A Postman collection named `Auth.postman_collection.json` is included in the project. It contains all possible API requests with annotations indicating whether each request should be allowed or denied based on user permissions.

To use the collection:

1. Import the collection into Postman
2. Create an environment with the following variables:
   - `apiUrl`: The URL of your deployed API Gateway
   - `idToken`: The ID token obtained from the login script
3. Run the requests in the collection

## Testing

The project includes integration tests that can be run against a deployed instance:

```bash
npm run test:integration
```

See `test/integration/README.md` for more details on the integration tests.

## Troubleshooting

### Common Issues

- **Deployment Failures**: Check the CloudFormation console for detailed error messages
- **Authentication Errors**: Ensure you're using a valid and non-expired ID token
- **API Errors**: Check CloudWatch logs for the specific Lambda function

### Logs

Lambda function logs are available in CloudWatch Logs. Each function has its own log group with the naming pattern `/aws/lambda/OrderService-*`.

## Contributing

1. Follow the established architecture and coding patterns
2. Ensure all code adheres to the SOLID principles
3. Write tests for new functionality
4. Update documentation as needed

## License

This project is licensed under the MIT License - see the LICENSE file for details.
