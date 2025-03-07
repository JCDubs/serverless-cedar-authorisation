# Postman Integration Tests

## Introduction

The integration directory is used to store all integration test logic and configuration per country. A directory for each deployable country should be located in the integration directory. The type of integration test implemented will be based on the type/s of services created and deployed by the project. For API service based projects, newman postman tests would make more sense than running jest integration tests where asynchronous interaction between services is being tested.

## Running Postman Tests

Each country directory should contain json files containing the body of each request. The json file name must also be set as the name of the environment variable used in the postman tests.

The following command format should be used to run the tests.


```bash
COUNTRY={country} API_URL={complete API url including environment stage} npm run test:integration
```

The following is an example of running the tests for the GB in the prod environment.

```bash
COUNTRY=gb API_URL=https://9c16xt6wzj.execute-api.eu-west-1.amazonaws.com/prod/ npm run test:integration
```

The placeholder `test:integration:{country}` package.json script task should be modified to run the above commands per country.

## Running Jest Tests

Jest integration tests per country should be stored in the directory for the country under test. The following command should be used to run jest integration tests.

```bash
COUNTRY=gb ./scripts/generate-paths.js,
COUNTRY=gb jest --testPathPattern=".*/test/integration/gb/"
```

The placeholder `test:integration:{country}` package.json script task should be modified to run the above commands per country.
