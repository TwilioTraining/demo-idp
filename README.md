# Demo IdP

Demo Identity Provider for Flex SSO integration challenge.

*Note: At the moment this needs to be executed from Twilio Training's C9 virtual environment.*


## Installation

Simply clone this repository and run the install script:

```
cd demo-idp
./install.sh
```

Then follow the instructions returned by the script.


## Startup

Start the Identity Provider server by running:

```
npm start
```

Then head over to [flex.twilio.com](https://flex.twilio.com) and enter your runtime domain (you can find it in your console [here](https://www.twilio.com/console/runtime)).

You will be taken to your IdP's page, here you can simply provide any user details (remember, this is a demo IdP, so no authentication is really performed), select your Flex user role and hit Sign In.

TaskRouter Worker will be automatically created and you will be logged in as the user you have specified.