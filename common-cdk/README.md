# Common CDK Constructs

This project provides reusable AWS CDK constructs that can be shared across different CDK applications. Currently, it includes constructs for working with Cedar-based authorization infrastructure.

## Available Constructs

### AuthPolicyStore

The `AuthPolicyStore` construct provides an interface to work with a centralized Cedar authorization policy store. It allows you to:

- Reference the shared central authorization policy S3 bucket
- Upload Cedar policy and schema files to the bucket
- Organize policies by service name

## Installation

```bash
npm install @your-org/common-cdk
```

## Usage

### AuthPolicyStore Example

```typescript
import { AuthPolicyStore } from '@your-org/common-cdk';
import * as path from 'path';

// In your CDK stack
const policyStore = new AuthPolicyStore(this, 'MyServicePolicyStore', {
  cedarDirectoryPath: path.join(__dirname, '../cedar'), // Directory containing your Cedar policies
  serviceName: 'my-service',
  organisationName: 'my-organisation',
});
```

### Cedar Directory Structure

Your Cedar policies should be organized in a directory structure like this:

```
cedar/
├── policies/
│   └── policy.cedar
└── schema/
    └── schema.cedar
```

## Development Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd common-cdk
```

2. Install dependencies:

```bash
npm install
```

3. Build the project:

```bash
npm run build
```

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
