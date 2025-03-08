# Serverless Cedar Authorisation Framework

## Overview

This project implements a comprehensive granular authorization framework using AWS Cedar Policy and AWS CDK. It provides fine-grained access control for microservices, with a specific implementation for an Order Service as a reference example.

The framework follows clean architecture principles, SOLID design, and AWS Well-Architected best practices to ensure maintainability, scalability, and security.

## Key Features

- **Fine-grained Authorization**: Role-based access control with Cedar Policy language
- **Serverless Architecture**: Built on AWS Lambda, API Gateway, and DynamoDB
- **Clean Architecture**: Hexagonal (ports and adapters) design with clear separation of concerns
- **Infrastructure as Code**: AWS CDK implementation with best practices
- **Reusable Components**: Shared constructs, resources, and SDK for consistent implementation across services
- **Comprehensive Testing**: Authorization tests for different roles and permissions

## Project Components

### common-cdk

Reusable AWS CDK constructs for Cedar-based authorization infrastructure:

- `AuthPolicyStore`: Interface to work with a centralized Cedar authorization policy store

### common-resources

Shared AWS resources required for Cedar-based authorization:

- **Cedar Lambda Layer**: Contains the Cedar WASM package for Lambda functions
- **Central Policy Store**: S3 bucket that stores Cedar authorization policies and schemas

### common-sdk

SDK for implementing authorization in services:

- **Authorization Middleware**: Middy middleware for Lambda handlers
- **Authorization Service**: Core service for evaluating permissions
- **User Details Service**: Retrieves and validates user information

### order-service

Reference implementation of a service using the authorization framework:

- Complete CRUD operations for managing orders
- Role-based access control with different permissions
- Serverless architecture with AWS Lambda, API Gateway, and DynamoDB
- Single-table design for DynamoDB

## Authorization Model

The framework implements a role-based access control model with the following roles:

- **Customer**: Can create orders and view their own orders
- **Sales Staff**: Can create orders for any customer, view all orders, and modify pending orders
- **Sales Manager**: Same permissions as Sales Staff
- **Account Manager**: Can view orders for customers they manage
- **Accountant**: Can view all orders but cannot modify them

## Getting Started

### Prerequisites

- Node.js (v18 or later)
- AWS CDK CLI
- AWS CLI configured with appropriate credentials
- Docker (for building the Lambda layer)

### Environment Setup

1. Create a `.env` file in the common-resources directory with:

```
ORGANISATION_ID=your_org_id_here
ORGANISATION_NAME=your_org_name_here
```

2. Install dependencies for each component:

```bash
# Install dependencies for common-cdk
cd common-cdk
npm install

# Install dependencies for common-resources
cd ../common-resources
npm install

# Install dependencies for common-sdk
cd ../common-sdk
npm install

# Install dependencies for order-service
cd ../order-service
npm install
```

### Deployment

1. Deploy common resources first:

```bash
cd common-resources
npm run deploy
```

2. Deploy the order service:

```bash
cd ../order-service
npm run deploy
```

### Testing the Order Service

1. Initialize the database and user pool:

```bash
# Create sample users and groups
node scripts/create-users.js

# Insert sample order and customer data
node scripts/hydrate.js
```

2. Authenticate with a test user:

```bash
# For example, to login as a sales manager
./scripts/login/michael.sh
```

3. Use the generated ID token to make API requests:

```bash
# Example: List all orders
curl -H "Authorization: <ID_TOKEN>" https://<API_GATEWAY_URL>/orders
```

4. Alternatively, import the included Postman collection (`order-service/Auth.postman_collection.json`) for testing.

## Development

### Adding a New Service

1. Create a new service directory following the structure of the order-service
2. Implement the primary and secondary adapters, use cases, and models
3. Use the common-sdk for authorization
4. Deploy the Cedar policies and schema using the AuthPolicyStore construct

### Extending Authorization Rules

1. Modify the Cedar policies in your service's cedar directory
2. Update the schema if needed
3. Deploy the changes using the AuthPolicyStore construct

## Architecture

The framework follows a hexagonal (ports and adapters) architecture:

- **Primary Adapters**: Handle incoming requests (API Gateway + Lambda)
- **Use Cases**: Contain the business logic
- **Secondary Adapters**: Handle outgoing requests (DynamoDB, S3)

Authorization is implemented as middleware that evaluates permissions before executing the business logic.

## AWS Well-Architected Considerations

- **Security**: Fine-grained access control with Cedar Policy
- **Reliability**: Serverless architecture with managed services
- **Performance Efficiency**: DynamoDB with single-table design
- **Cost Optimization**: Pay-per-use model with serverless components
- **Operational Excellence**: Comprehensive logging, metrics, and tracing

## Resources

- [Cedar Policy Documentation](https://www.cedarpolicy.com/en/tutorial)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [AWS Lambda Powertools](https://awslabs.github.io/aws-lambda-powertools-typescript/latest/)
- [Middy Middleware](https://middy.js.org/)

## License

MIT License

Copyright (c) 2024

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
