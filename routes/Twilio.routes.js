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

const twilioServer = "https://verify.twilio.com";
// const serviceSid = 'VAf04a776258bab3e2c11286dc4152cf3d';

router.post(`/v2/Services/${process.env.TWILIO_SERVICE_ID}/Verifications`, (req, res) => {
    console.log(`redirecting to Twilio ${req.url}`);

    // coming from survey

    apiProxy.web(req, res, {target: twilioServer}); 
});

router.post(`/v2/Services/${process.env.TWILIO_SERVICE_ID}/VerificationCheck`, (req, res) => {
    console.log(`redirecting to Twilio ${req.url}`);

    // coming from survey

    apiProxy.web(req, res, {target: twilioServer}); 
});

module.exports = router;