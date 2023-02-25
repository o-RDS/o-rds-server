var express = require("express"),
    router = express.Router(), {
        verification,
        verificationCheck
    } = require("../controllers/survey.auth.controller")

require("dotenv").config();


// will require rate limiting 
router.post('/api/twilio/verification', verification, (req, res) => {

});

router.post('/api/twilio/verificationCheck', verificationCheck, (req, res) => {

});

module.exports = router;