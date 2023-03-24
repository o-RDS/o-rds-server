# o-RDS Proxy Server

This is the proxy server for the [o-RDS web app client](https://github.com/o-RDS/o-rds-web-app). This server is meant to provide integrity and confidentiality to both user data and to the API secrets. 


### Authentication and Authorization
This server uses admin and survey taker data as a way of signing and verifying JWTs (JSON web tokens), so we can be sure the people trying to access our endpoints are properly authorized/verified users. For admins we save their email and password ([salted and hashed](./controllers/admin.auth.controller.js)), while for survey takers we save their phone number and the 6-digit code that was texted to them ([hashed with SHA256](./controllers//survey.auth.controller.js)).


# Setup Checklist

### 1: Set up incentive payment and phone verification service accounts
The current version of o-RDS utilizes two services for this process: Tremendous for incentive payments, and Twilio for phone verification. It will require anyone who wants their own version of o-RDS to create accounts with these services, and configure their API keys to work with this server. 

[Use our separate docs on how to set up these accounts](./routes), then return here. 

### 2: Set up the database 


### 3: Configure .env file
A .env file contains a list of key-value pairs which can be used as variables within the code, in order to prevent the use of API secrets as plaintext. We have provided a .env.development file with only keys, so you can fill them out with your own specific values.

**Be sure to add .env.development to your .gitignore (or simply rename it to '.env'), so your keys are not visible on your own repository.**

### 4: Starting and Hosting this server
How to start this server

    npm start


This is an ExpressJS application, so there are many ways it can be hosted and publicly accessible by the [admin client](https://github.com/o-RDS/o-rds-web-app). The o-RDS team used [Railway](https://railway.app/) and we followed [this tutorial](https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs/deployment). 

### 5: Moving to a production environment
There may be a number of settings/variables in the .envf file that are set a specific way during development/testing. Use the checklist below once you're ready to move to a production envrionment. 

1. TESTING=false
2. TREMENDOUS_BEARER_TOKEN and TREMENDOUS_SERVER shoud not be using the testflight environment
3. If you were using a free Twilio account, switch over keys and phone number to the paid account
4. Though not necessary, it is a good idea to generate a new JWT_API_SECRET

[comment]: <> (This will be where we can link to the OpenAPI spec document)
# Endpoints
