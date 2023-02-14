// const httpProxy = require('http-proxy'); 
var express = require("express"),
    router = express.Router();
verifySurveyToken = require("../middlewares/authJWT");
const fetch = (...args) =>
	import('node-fetch').then(({default: fetch}) => fetch(...args));

require("dotenv").config();


//Use this options for creating a reverse proxy to other domains.
// const options = {
//     changeOrigin: true,
//     target: {
//         https: true
//     }
// }
// //Create a reverse proxy server
// const apiProxy = httpProxy.createProxyServer(options);


// router.get('/api/v2/campaigns', (req, res) => {
//     console.log(`redirecting to Tremendous ${req.url}`);

//     // verify JWT
//     // add on Tremendous Auth
//     req.headers.authorization = "Bearer " + process.env.TREMENDOUS_BEARER_TOKEN;

//     apiProxy.web(req, res, {target:  process.env.TREMENDOUS_SERVER});
// });

// router.get('/api/v2/funding_sources', (req, res) => {
//     console.log(`redirecting to Tremendous ${req.url}`);

//     // verify JWT
//     // add on Tremendous Auth
//     req.headers.authorization = "Bearer " + process.env.TREMENDOUS_BEARER_TOKEN;

//     apiProxy.web(req, res, {target:  process.env.TREMENDOUS_SERVER});
// });

// router.post('/api/v2/orders', (req, res) => {
//     console.log(`redirecting to Tremendous ${req.url}`);

//     // coming from survey
//     // add on Tremendous Auth
//     req.headers.authorization = "Bearer " + process.env.TREMENDOUS_BEARER_TOKEN;

//     apiProxy.web(req, res, {target:  process.env.TREMENDOUS_SERVER}); 
// });

// const sdk = require('api')('@tremendous/v2#kny22dldusg22a');

router.post('/tremendous/sendPayment', (req, res) => {
    const options = {
        method: 'POST',
        headers: {
            accept: 'application/json',
            Authorization: "Bearer " + process.env.TREMENDOUS_BEARER_TOKEN
        },
        body: req.body
      };

      console.log(req.body);
      
      // TODO: JSON object contained in request body is invalid. payload: { payment: [Array] }
      fetch('https://testflight.tremendous.com/api/v2/orders', options)
        .then(response => response.json())
        .then(response => console.log(response))
        .catch(err => console.error(err));
});

module.exports = router;