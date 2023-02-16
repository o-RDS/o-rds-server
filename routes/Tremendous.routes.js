// const httpProxy = require('http-proxy'); 
var express = require("express"),
    router = express.Router();
verifySurveyToken = require("../middlewares/authJWT");
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

require("dotenv").config();


router.get('/tremendous/listCampaigns', (req, res) => {

    // TODO: verify JWT

    console.log("forwarding to tremendous.com/api/v2/campaigns");

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: "Bearer " + process.env.TREMENDOUS_BEARER_TOKEN
        }
      };

      fetch('https://testflight.tremendous.com/api/v2/campaigns', options)
      .then(response => response.json())
      .then(response => {
          res.status(200).send(response);
      })
      .catch(err => {
          console.log(err);
          res.status(500).send(err);
      });

});


router.get('/tremendous/listFundingSources', (req, res) => {

    // TODO: verify JWT

    console.log("forwarding to tremendous.com/api/v2/funding_sources");

    const options = {
        method: 'GET',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: "Bearer " + process.env.TREMENDOUS_BEARER_TOKEN
        }
    };

    fetch('https://testflight.tremendous.com/api/v2/funding_sources', options)
    .then(response => response.json())
    .then(response => {
        res.status(200).send(response);
    })
    .catch(err => {
        console.log(err);
        res.status(500).send(err);
    });

});


router.post('/tremendous/sendPayment', (req, res) => {

    // TODO: verify JWT

    console.log("forwarding to tremendous.com/api/v2/orders");

    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            'content-type': 'application/json',
            Authorization: "Bearer " + process.env.TREMENDOUS_BEARER_TOKEN
        },
        body: JSON.stringify({
            external_id: req.body.external_id, 
            payment: {funding_source_id: req.body.funding_source_id, channel: 'UI'},
            rewards: [
            {
                campaign_id: req.body.campaign_id, 
                products: req.body.products,
                value: {denomination: req.body.denomination, currency_code: 'USD'},
                recipient: {name: req.body.recipient.name, email: req.body.recipient.email, phone:  req.body.recipient.phone},
                delivery: {method: req.body.method}
            }
            ]
        })
      };

      fetch('https://testflight.tremendous.com/api/v2/orders', options)
        .then(response => response.json())
        .then(response => {
            res.status(200).send({
                status: response.order.status,
                created_at: response.order.created_at,
                payment: {
                    subtotal: response.order.payment.subtotal,
                    total: response.order.payment.total,
                    fees: response.order.payment.fees
                }
            });
        })
        .catch(err => {
            console.error(err);
            res.status(500).send(err);
        });
});

module.exports = router;