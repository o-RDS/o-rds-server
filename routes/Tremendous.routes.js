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


router.get('/api/v2/campaigns', (req, res) => {
    console.log(`redirecting to Tremendous ${req.url}`);

    // verify JWT
    // add on Tremendous Auth
    req.headers.authorization = process.env.TREMENDOUS_BEARER_TOKEN;

    apiProxy.web(req, res, {target:  process.env.TREMENDOUS_SERVER});
});

router.get('/api/v2/funding_sources', (req, res) => {
    console.log(`redirecting to Tremendous ${req.url}`);

    // verify JWT
    // add on Tremendous Auth
    req.headers.authorization = process.env.TREMENDOUS_BEARER_TOKEN;

    apiProxy.web(req, res, {target:  process.env.TREMENDOUS_SERVER});
});

router.post('/api/v2/orders', (req, res) => {
    console.log(`redirecting to Tremendous ${req.url}`);

    // coming from survey
    // add on Tremendous Auth
    req.headers.authorization = process.env.TREMENDOUS_BEARER_TOKEN;

    apiProxy.web(req, res, {target:  process.env.TREMENDOUS_SERVER}); 
});

module.exports = router;