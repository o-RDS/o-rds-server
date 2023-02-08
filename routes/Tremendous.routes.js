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

// TODO: set this based on process status PROD/DEV
const devTremendousServer = 'https://testflight.tremendous.com'; 
// const prodTremendousServer = 'https://www.tremendous.com';

router.get('/api/v2/campaigns', (req, res) => {
    console.log(`redirecting to Tremendous ${req.url}`);
    apiProxy.web(req, res, {target: devTremendousServer});
});

router.get('/api/v2/funding_sources', (req, res) => {
    console.log(`redirecting to Tremendous ${req.url}`);
    apiProxy.web(req, res, {target: devTremendousServer});
});

router.post('/api/v2/orders', (req, res) => {
    console.log(`redirecting to Tremendous ${req.url}`);
    apiProxy.web(req, res, {target: devTremendousServer}); 
});

module.exports = router;