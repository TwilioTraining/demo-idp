const { runServer } = require('saml-idp');

runServer({
  acsUrl: `https://preview.twilio.com/iam/Accounts/<ACCOUNT_SID>/saml2`,
  audience: `https://preview.twilio.com/iam/Accounts/<ACCOUNT_SID>/saml2`,
  issuer: `http://<HOSTNAME>/entityid`,
  config: {
    metadata: [{
      id: 'full_name',
      optional: false,
      displayName: 'Full Name',
      description: 'The full name of the user',
      multiValue: false
    }, {
      id: 'email',
      optional: false,
      displayName: 'E-Mail Address',
      description: 'The e-mail address of the user',
      multiValue: false
    }, {
      id: "roles",
      optional: false,
      displayName: 'User Roles',
      description: 'The roles of user',
      options: ['agent', 'admin', 'supervisor']
    }],
    user: {
      userName: 'joe.owling@example.com',
      email: 'joe.owling@example.com',
      full_name: 'Joe Owling'
    }
  }
});

