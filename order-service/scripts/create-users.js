#!/usr/bin/env node
const AWS = require('aws-sdk');
AWS.config.region = 'eu-west-1';
const cognitoIDP = new AWS.CognitoIdentityServiceProvider();

const userPoolId = '{USER_POOL_ID}';

const usersAndGroups = [
  {
    name: 'customers',
    users: [
      {
        firstName: 'steven',
        lastName: 'jones',
      },
      {
        firstName: 'philip',
        lastName: 'roberts',
      },
    ],
  },
  {
    name: 'saleStaff',
    users: [
      {
        firstName: 'michael',
        lastName: 'smith',
      },
      {
        firstName: 'emily',
        lastName: 'johnson',
      },
    ],
  },
  {
    name: 'saleManagers',
    users: [
      {
        firstName: 'chris',
        lastName: 'watkin',
      },
    ],
  },
  {
    name: 'accountManagers',
    users: [
      {
        firstName: 'aron',
        lastName: 'jenkins',
      },
      {
        firstName: 'rebecca',
        lastName: 'jones',
      },
    ],
  },
  {
    name: 'accountants',
    users: [
      {
        firstName: 'pam',
        lastName: 'rollands',
      },
    ],
  },
];

usersAndGroups.forEach(async group => {
  try {
    await cognitoIDP
      .createGroup({
        GroupName: group.name,
        UserPoolId: userPoolId,
      })
      .promise();
  } catch (err) {
    console.log('Skipping group creation. It may already exist.');
  }
  group.users.forEach(async user => {
    const userEmail = `${user.firstName}.${user.lastName}@test.com`;
    try {
      // MessageActionType SUPPRESS ensures no confirmation email is sent on user creation.
      await cognitoIDP
        .adminCreateUser({
          UserPoolId: userPoolId,
          Username: userEmail,
          MessageAction: 'SUPPRESS',
        })
        .promise();
    } catch (err) {
      console.error('User creation failed.');
      throw err;
    }

    try {
      await cognitoIDP
        .adminSetUserPassword({
          UserPoolId: userPoolId,
          Username: userEmail,
          Password: `${user.firstName}${user.lastName}123`,
          Permanent: true,
        })
        .promise();
    } catch (err) {
      console.log('Setting user password failed.');
      throw err;
    }

    try {
      await cognitoIDP
        .adminAddUserToGroup({
          GroupName: group.name,
          UserPoolId: userPoolId,
          Username: userEmail,
        })
        .promise();
    } catch (err) {
      console.log('Adding user to group failed.');
      throw err;
    }
  });
});
