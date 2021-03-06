const { runServer } = require('saml-idp');
const fs = require("fs");
const ngrok = require('ngrok');

const forge = require('node-forge');
forge.options.usePureJavaScript = true;

const readline = require('readline-sync');

const log_file = './server.log';
const key_file = './idp-private-key.pem';
const cert_file = './idp-public-cert.pem';
const config_file = './config.json';
const config = require(config_file);

const c_green = "\u001b[32m";
const c_reset = "\u001b[0m";

// AccountSid
const getAccountSid = async () => {
  const account_sid = readline.question(`${c_green}? \u001b[0m\u001b[1mTwilio Flex Account SID${c_reset} `);
  if (!account_sid.match(/^AC[0-9a-z]{32}$/)) {
    console.error("Not a valid Account SID. Aborting...");
    process.exit()
  }
  config.account_sid = account_sid;
  fs.writeFileSync(config_file, JSON.stringify(config), function (err, data) {
    if (err) console.log(err);
  });
}
if (!config.account_sid || !config.account_sid.match(/^AC[0-9a-z]{32}$/)) getAccountSid();

// x509 Certificate
try {
  // if key file doesn't exist, regenerate cert & key
  if (!(fs.existsSync(key_file) && fs.existsSync(cert_file))) {
    console.log("Generating x509 certificate...");
    var pki = forge.pki;
    var keys = pki.rsa.generateKeyPair(2048);
    var cert = pki.createCertificate();

    cert.publicKey = keys.publicKey;
    cert.serialNumber = '01';
    cert.validity.notBefore = new Date();
    cert.validity.notAfter = new Date();
    cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
    var attrs = [
      { name: 'commonName', value: 'Test Identity Provider' }
      , { name: 'countryName', value: 'US' }
      , { shortName: 'ST', value: 'California' }
      , { name: 'localityName', value: 'San Francisco' }
      , { name: 'organizationName', value: 'Twilio' }
      , { shortName: 'OU', value: 'Test Identity Provider' }
    ];
    cert.setSubject(attrs);
    cert.setIssuer(attrs);
    cert.sign(keys.privateKey);

    const pem_key = pki.privateKeyToPem(keys.privateKey);
    const pem_cert = pki.certificateToPem(cert);

    fs.writeFileSync(cert_file, pem_cert, function (err, data) {
      if (err) console.log(err);
    });
    fs.writeFileSync(key_file, pem_key, function (err, data) {
      if (err) console.log(err);
    });
  }
} catch (err) {
  console.error(err)
  process.exit()
}

const pem_cert = fs.readFileSync(cert_file, "utf8");
const port = parseInt(process.env.PORT) || 7000;
ngrok.connect(port)
  .then(url => {
    console.log("SSO Setup Instructions:\n");
    console.log(" 1. Open your Twilio console at Flex -> Single Sign-On");
    console.log("    (or open this link https://www.twilio.com/console/flex/single-sign-on)");
    console.log(" 2. Copy and paste the following details into the page");
    console.log(`\n${c_green}Friendly Name${c_reset}`);
    console.log("Demo IdP");
    console.log(`\n${c_green}X.509 Certificate${c_reset}`);
    console.log(pem_cert);
    console.log(`${c_green}Identity Provide Issuer${c_reset}`);
    console.log(`${url}/entityid`);
    console.log(`\n${c_green}Single Sign-On URL${c_reset}`);
    console.log(`${url}/saml/sso`);
    console.log(`\n${c_green}Twilio SSO URL${c_reset}`);
    console.log(`Uses iam.twilio.com`);
    console.log(`\n 3. Head over to flex.twilio.com and login using SSO\n`);
    process.stdout.write("IdP server is now running...");

    const log = fs.createWriteStream(log_file);
    process.stdout.write = process.stderr.write = log.write.bind(log);

    runServer({
      acsUrl: `https://iam.twilio.com/v1/Accounts/${config.account_sid}/saml2`,
      audience: `https://iam.twilio.com/v1/Accounts/${config.account_sid}/saml2/metadata`,
      issuer: `${url}/entityid`,
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
          displayName: 'Flex User Role',
          description: 'The role of user',
          options: ['agent', 'admin', 'supervisor']
        }],
        user: {
          userName: 'joe.owling',
          email: 'joe.owling@example.com',
          full_name: 'Joe Owling'
        }
      }
    });
  })

