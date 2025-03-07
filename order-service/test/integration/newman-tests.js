/* eslint-disable n/no-process-exit */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const newman = require('newman');
const uuid = require('uuid');
const fs = require('fs');
const path = require('path');

if (!process.env.POSTMAN_COLLECTION) {
  throw Error('Please provide the "POSTMAN_COLLECTION" environment variable.');
}

if (!process.env.COUNTRY) {
  throw Error('Please provide the "COUNTRY" environment variable.');
}

if (!process.env.API_URL) {
  throw Error('Please provide the "API_URL" environment variable.');
}

const collection = process.env.POSTMAN_COLLECTION;
const country = process.env.COUNTRY;
const apiUrl = process.env.API_URL;

const loadEnvironmentVariables = environment => {
  const integrationDir = path.join(__dirname, country);
  fs.readdirSync(integrationDir).forEach(file => {
    const fileContents = fs.readFileSync(
      path.join(integrationDir, file),
      'utf-8',
    );
    environment.values.push({
      key: file.split('.')[0],
      value: fileContents,
      type: 'default',
      enabled: true,
    });
  });
};

(async () => {
  const config = {
    environment: {
      id: uuid.v4(),
      name: `${collection}-tests`,
      values: [
        {
          key: 'API_ENDPOINT',
          value: apiUrl,
          type: 'default',
          enabled: true,
        },
      ],
    },
    collection: require(`./${collection}.postman_collection.json`),
    reporters: 'cli',
    bail: true,
  };
  loadEnvironmentVariables(config.environment);

  const onComplete = (error, summary) => {
    if (error || summary.run.error || summary.run.failures.length) {
      process.exit(1);
    } else {
      console.log('Complete');
    }
  };

  newman.run(config, onComplete);
})();
