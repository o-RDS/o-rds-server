var express = require("express"),
    router = express.Router(), {
        verification,
        verificationCheck
    } = require("../controllers/survey.auth.controller")
require("dotenv").config();
const { apiLimiter } = require("../middlewares/rateLimit");



// will require rate limiting 
router.post('/api/twilio/verification', apiLimiter, verification, (req, res) => {
    console.log(req.ip + ` POST /api/twilio/verification`);
});

router.post('/api/twilio/verificationCheck', apiLimiter, verificationCheck, (req, res) => {
    console.log(req.ip + ` POST /api/twilio/verificationCheck`);
});

module.exports = router;