'use strict';

import dotenv from 'dotenv';
dotenv.load();

module.exports = {
  env: 'development',
  port: process.env.PORT || 3001,
  secret: process.env.SESSION_SECRET,
  auth0Domain: process.env.AUTH0_DOMAIN,
  auth0ClientID: process.env.AUTH0_CLIENT_ID,
  auth0ClientSecret: process.env.AUTH0_CLIENT_SECRET,
  auth0CallbackURL:process.env.AUTH0_CALLBACK_URL,
  auth0LogoutCallbackURL:process.env.AUTH0_LOGOUT_CALLBACK_URL,
  auth0ManagementClientID:process.env.AUTH0_MANAGEMENT_CLIENT_ID,
  auth0ManagementClientSecret:process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
  rootDomainDemoApp: process.env.ROOT_DOMAIN_DEMO_APP,
  rootDomainPassportApp: process.env.ROOT_DOMAIN_PASSPORT_APP,
  accessToken: process.env.ACCESS_TOKEN,
};