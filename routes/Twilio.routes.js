var express = require("express"),
    router = express.Router(), {
        verification,
        verificationCheck
    } = require("../controllers/survey.auth.controller")

require("dotenv").config();
import { apiLimiter } from "../middlewares/rateLimit";


// will require rate limiting 
router.post('/api/twilio/verification', apiLimiter, verification, (req, res) => {

});

router.post('/api/twilio/verificationCheck', apiLimiter, verificationCheck, (req, res) => {

});

module.exports = router;