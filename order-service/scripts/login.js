#!/usr/bin/env node
const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
const cognitoIDP = new AWS.CognitoIdentityServiceProvider();

const loginUser = async (firstName, lastName, clientId) => {
  try {
    const signedInUser = await cognitoIDP
      .initiateAuth({
        AuthFlow: 'USER_PASSWORD_AUTH',
        ClientId: clientId,
        AuthParameters: {
          USERNAME: `${firstName}.${lastName}@test.com`,
          PASSWORD: `${firstName}${lastName}123`,
        },
      })
      .promise();
    console.log(`\ID Token: ${signedInUser.AuthenticationResult.IdToken}\n`,);

  } catch (err) {
    console.error('User creation failed.');
    throw err;
  }
}

let firstName = process.argv
  .filter((arg) => arg.startsWith('--name='))[0]
  ?.split('=')[1];
let lastName = process.argv
  .filter((arg) => arg.startsWith('--lastname='))[0]
  ?.split('=')[1];

if (!firstName || !lastName) {
  throw new Error('firstName and lastName are required');
}
const clientId = '{CLIENT-ID}';
loginUser(firstName, lastName, clientId);
