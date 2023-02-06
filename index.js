const express = require("express");
const cors = require('cors');
const httpProxy = require('http-proxy'); 
const { response } = require("express");

const app = express()
const port = 8080

app.set('x-powered-by' , 'Express.js');
app.use(cors());

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


app.get('/api/v2/funding_sources', (req, res) => {
    console.log(`redirecting to Tremendous ${req.url}`);
    apiProxy.web(req, res, {target: devTremendousServer});
});

app.post('/api/v2/orders', (req, res) => {
    console.log(`redirecting to Tremendous ${req.url}`);
    apiProxy.web(req, res, {target: devTremendousServer}); 
});


const twilioServer = "https://verify.twilio.com";
const serviceSid = 'VAf04a776258bab3e2c11286dc4152cf3d';

app.post(`/v2/Services/${serviceSid}/Verifications`, (req, res) => {
    console.log(`redirecting to Twilio ${req.url}`);
    apiProxy.web(req, res, {target: twilioServer}); 
});

app.post(`/v2/Services/${serviceSid}/VerificationCheck`, (req, res) => {
    console.log(`redirecting to Twilio ${req.url}`);
    apiProxy.web(req, res, {target: twilioServer}); 
});

// default route
app.use((req, res) => {
    response.send("Error: not allowed.");
});

//Start the server
app.listen(port, () => {
    console.log(`Server is up on port ${port}.`);
});
