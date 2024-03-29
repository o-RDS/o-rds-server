var express = require("express"),
    router = express.Router();
verifySurveyToken = require("../middlewares/survey.JWT.auth");
verifyAdminToken = require("../middlewares/admin.JWT.auth");
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));
const {
  claimCompletionIncentive,
  claimReferralIncentive
} = require("../database/firestoreFunctions");
require("dotenv").config();


function gotJWT(req, res, next) {
    if (req.body.user == undefined) {
      res.status(403)
        .send({
          message: "Invalid JWT token"
        });
    } else {
      next();
    }
  }

router.get('/api/tremendous/listCampaigns', verifyAdminToken, gotJWT, (req, res) => {
    console.log(req.ip + ` GET /api/tremendous/listCampaigns`);

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


router.get('/api/tremendous/listFundingSources', verifyAdminToken, gotJWT, (req, res) => {
    console.log(req.ip + ` GET /api/tremendous/listFundingSources`);

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

/*
router.post('/api/tremendous/sendPayment', verifySurveyToken, gotJWT, (req, res) => {

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
                recipient: {name: req.body.recipient.name, email: req.body.recipient.email},
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
*/

router.post('/api/survey/:surveyID/sendPayment/:mode', verifySurveyToken, gotJWT, async (req, res) => {
  console.log(req.ip + ` POST /api/survey/${req.params.surveyID}/sendPayment/${req.params.mode}`);

  var amountToPay;
  if (req.params.mode == 'complete') {
    // TODO verify that the user has completed the survey and not claimed the reward
    amountToPay = await claimCompletionIncentive(req.params.surveyID, req.body.user.hash);
  }
  else if (req.params.mode == 'referral') {
    // TODO verify that the user has more referrals waiting to be claimed
    amountToPay = await claimReferralIncentive(req.params.surveyID, req.body.user.hash);
  }
  else {
    res.status(400).send({message: "Invalid mode"});
    return;
  }
  if (amountToPay === undefined) {
    res.status(400).send({message: "Unable to claim reward"});
    return;
  }

  const options = {
      method: 'POST',
      headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          Authorization: "Bearer " + process.env.TREMENDOUS_BEARER_TOKEN
      },
      body: JSON.stringify({
          payment: {funding_source_id: req.body.funding_source_id, channel: 'UI'},
          rewards: [
          {
              campaign_id: req.body.campaign_id, 
              value: {denomination: amountToPay, currency_code: 'USD'},
              recipient: {name: req.body.recipient.name, email: req.body.recipient.email},
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