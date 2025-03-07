# Common Resources for Cedar Authorization

This project deploys shared AWS resources required for Cedar-based authorization across your organization. It consists of two main components:

1. **Cedar Lambda Layer**: A Lambda layer containing the Cedar WASM package that can be used by Lambda functions to perform Cedar-based authorization.
2. **Central Policy Store**: An S3 bucket that stores Cedar authorization policies and schemas.

## Prerequisites

- Node.js (v18 or later)
- AWS CDK CLI
- AWS CLI configured with appropriate credentials
- Docker (for building the Lambda layer)

## Environment Setup

1. Create a `.env` file in the project root with the following variables:

```
ORGANISATION_ID=your_org_id_here
ORGANISATION_NAME=your_org_name_here
```

2. Install dependencies:

```
npm install
```

The package.json file contains a post install script that copies the installed cedar WASM package to the dist folder. The content of the dist folder is added to the Lambda layer on deployment.

## Deployment

1. Deploy the Cedar Lambda Layer:

```
npm run deploy
```
