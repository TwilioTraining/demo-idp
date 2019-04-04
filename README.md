# Demo IdP

Demo Identity Provider for Flex SSO integration challenge.

## Installation

Simply clone the repository, run the install script and provide your Flex Account SID:

```
cd demo-idp
./install.sh
? Twilio Flex Account SID <your_account_sid>
```

Then follow the instructions returned by the script.


## Startup

Start the Identity Provider server by running:

```
npm start
```

Then head over to [flex.twilio.com](https://flex.twilio.com) and enter your runtime domain (you can find it in your console [here](https://www.twilio.com/console/runtime).

You will be taken to your IdP's page, here you can simply provide any user details (remember, this is a demo IdP, so no authentication is really performed), select your Flex user role and hit Sign In.

TaskRouter Worker will be automatically created and you will be logged in as the user you have specified.