#!/bin/bash
key=idp-private-key.pem
cert=idp-public-cert.pem
hostname=`curl --silent http://169.254.169.254/latest/meta-data/public-hostname; echo`:8080

# certificate doesn't exist - run setup
if [ ! -f $cert ]; then
  bold=$(tput bold)
  normal=$(tput sgr0)
  green=$(tput setaf 2)
  echo -n "$green?$normal$bold Twilio Flex Account SID$normal "
  read account_sid
  if [[ ! $account_sid =~ ^AC[0-9a-z]{32}$ ]]; then
    echo "Not a valid Account SID. Aborting..."
    exit 1
  fi
  openssl req -x509 -new -newkey rsa:2048 -nodes \
    -subj '/C=US/ST=California/L=San Francisco/O=Twilio/CN=Test Identity Provider' \
    -keyout $key -out $cert -days 7300
  sed -i -e "s/<ACCOUNT_SID>/$account_sid/g" -e "s/<HOSTNAME>/$hostname/g" server.js
  npm install
  echo -e "\n\n${bold}${green}Installation complete${normal}"
  echo " 1. Open your Twilio console at Flex -> Single Sign-On"
  echo "    (or open this link https://www.twilio.com/console/flex/users/single-sign-on)"
  echo " 2. Copy and paste the following details into the page"
  echo -e "\n${green}Friendly Name${normal}"
  echo "Demo IdP"
  echo -e "\n${green}X.509 Certificate${normal}"
  cat $cert
  echo -e "\n${green}Identity Provide Issuer${normal}"
  echo "http://$hostname/entityid"
  echo -e "\n${green}Single Sign-On URL${normal}"
  echo "http://$hostname/saml/sso"

  echo -e "\n 3. Run 'npm start' to start the IdP server\n"
else
  echo "Public certificate file '$cert' already present. Aborting..."
fi
