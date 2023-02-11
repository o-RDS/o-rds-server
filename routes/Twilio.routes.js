const httpProxy = require('http-proxy'); 

var express = require("express"),
    router = express.Router();

//Use this options for creating a reverse proxy to other domains.
const options = {
    changeOrigin: true,
    target: {
        https: true
    }
}
//Create a reverse proxy server
const apiProxy = httpProxy.createProxyServer(options);


router.post(`/v2/Services/${process.env.TWILIO_SERVICE_ID}/Verifications`, (req, res) => {
    console.log(`redirecting to Twilio ${req.url}`);

    // coming from survey
    // Add Twilio auth
    req.headers.authorization = 'Basic ' + Buffer.from(process.env.TWILIO_ACCOUNT_SID + ":" + process.env.TWILIO_AUTH_TOKEN).toString('base64');

    apiProxy.web(req, res, {target: process.env.TWILIO_SERVER}); 
});

router.post(`/v2/Services/${process.env.TWILIO_SERVICE_ID}/VerificationCheck`, (req, res) => {
    console.log(`redirecting to Twilio ${req.url}`);

    // coming from survey
    // Add Twilio auth
    req.headers.authorization = 'Basic ' + Buffer.from(process.env.TWILIO_ACCOUNT_SID + ":" + process.env.TWILIO_AUTH_TOKEN).toString('base64');

    apiProxy.web(req, res, {target: process.env.TWILIO_SERVER}); 
});

module.exports = router;