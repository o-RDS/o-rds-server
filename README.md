# o-RDS Proxy Server

This is the proxy server for the [o-RDS web app client](https://github.com/o-RDS/o-rds-web-app). This server is meant to provide integrity and confidentiality to both our our users' data and API secrets. o-RDS requires the use of two services: Twilio and Tremendous, as well as a database and hosting service of choice. 


We've set up this server to handle all of its data locally. Admin accounts from the web client are saved in the folder admin.data, and survey taker information is saved in the folder survey.data. The reason this data is being saved locally, as opposed to being saved to a database, is because we do not want to enforce a storage service upon anyone who wants to use o-RDS for their own research purposes. 


Admin and survey taker data is used as a way of signing and verifying JWTs (JSON web tokens), so we can be sure the people trying to access our endpoints are only properly authorized users. For admin we save their email and password ([salted and hashed](./controllers/admin.auth.controller.js)), while for survey takers we save their phone number and the code that was sent to them ([hashed with SHA256](./controllers//survey.auth.controller.js)).


# How to start

    npm start


# How to set up

We have provided a .env file with the same keys which we have used in our development. Once you have set up an account and services with [Tremendous](https://www.tremendous.com/) and [Twilio](https://www.twilio.com/), simply fill in the values that are left empty in the .env file. Afterwards be sure to update .gitignore so these values are not tracked in your own repository. 


Both Twilio and Tremendous have ways of testing their services for free. We have utilized these heavily in our development, and we suggest others to do the same when setting up their own respondent driven sampling service. Twilio will give anyone $15 for free to test their services. For us, this was more than enough for months of testing. Tremendous provides a wonderful service called "testflight" in which you can test and develop for free with fake money. 


Once you're ready to switch to production and utilize both of these services with real money, simply update your .env file (or have a second one. Ex: .env.production) with the new keys and with the production Tremendous server URL. 


# [Endpoints](./routes)

## Tremendous

### GET: /tremendous/listCampaigns

Proxy endpoint for the [Tremendous API](https://developers.tremendous.com/reference/core-campaigns-index). Takes in the user information from the web client and a valid JWT authorization header to verify the request. 

Body:

    {
        "email": "newuser@siue.edu",
        "password": "mypassword"
    }

### GET: /tremendous/listFundingSources

Proxy endpoint for the [Tremendous API](https://developers.tremendous.com/reference/core-funding-source-index). Takes in the user information from the web client and a valid JWT authorization header to verify the request. 

Body:

    {
        "email": "newuser@siue.edu",
        "password": "mypassword"
    }

### POST: /tremendous/sendPayment

Proxy endpoint for the [Tremendous API](https://developers.tremendous.com/reference/core-orders-create). This time coming from the survey. The request body is all the necessary information required to create a new order (payment) for a survey taker. This endpoint also requires a valid JWT authorization header to verify the request. 

Body: 

    {
        "external_id": "",
        "funding_source_id": "",
        "campaign_id": "",
        "products": [""],
        "denomination": 5.00,
        "recipient": {"name": "new user", "email": "newuser@siue.edu"},
        "method": "EMAIL",
        "to": "+1..."
    }

Notes: (1) "external_id" must be unique per new order, or else the Tremendous API will treat it as if you are requesting information on a previous order. (2) "denomination" must be a positive non-zero number. (3) "to" is the survey taker's phone number in the international (+1) format. 

## Twilio

### POST: /twilio/verification

We are not utilizing Twilio's pre-made texting verification service, and instead we are using the standard texting service and verifying codes on our own so they can also be used for JWTs. This does require a Twilio phone number, as denoted in the .env file. This endpoint requires the request body to contain only the survey taker's phone number. 

Body:

    {
        "to": "+1..."
    }


### POST: /twilio/verificationCheck

This endpoint is not utilizing a Twilio API, and is instead verifying the survey taker's code with what the server has saved (as of now) locally. 

Body:

    {
        "to": "+1...",
        "code": "123456"
    }

### POST: /register

Allows users of the [admin client](https://github.com/o-RDS/o-rds-web-app) to register new accounts. This endpoint takes a user JSON object in the request body. 

Body:

    {
        "fullname": "new user",
        "email": "newuser@siue.edu",
        "role": "admin",
        "password": "mypassword"
    }

### POST: /login

Takes the same user JSON object as /register and the request body and returns a temporarily valid JWT for them to use at the admin-client to access resources and use the web page. 

Body:

    {
        "fullname": "new user",
        "email": "newuser@siue.edu",
        "role": "admin",
        "password": "mypassword"
    }

### GET: /hiddencontent

This is an example endpoint to show how content can be hidden based on the requesting user's authorization level. This endpoint will block a user from the "hidden content" if their account "role" is not "admin". This endpoint takes an email and password in the request body to check the user file. 

Body:

    {
        "email": "newuser@siue.edu",
        "password": "mypassword"
    }