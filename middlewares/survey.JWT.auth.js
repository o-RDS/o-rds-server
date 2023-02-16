const jwt = require("jsonwebtoken");
var fs = require('fs');
var crypto = require('crypto');

const verifySurveyToken  = (req, res, next) => {
    // checking validity of JWT
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_API_SECRET, function (err, decode) {
        if (err) {
            console.log(err);
            req.body.surveyTaker = undefined;
        }

        // convert phone number in req to hash to locate file
        const hash = crypto.createHash('sha256').update(req.body.to).digest('base64');

        // if valid, add user data onto req.body
        fs.readFile(`./survey.data/${hash}.json`, (err, data) => {
            if (err) {
                console.log(err);
                res.status(404).send({
                    message: "Survey taker not found. Body must contain phone number (Ex: \"+1123456789\")"
                });
            } else {
                var surveyTaker = JSON.parse(data);
                req.body.surveyTaker = surveyTaker;
                next();
            }
        });
        });
    } else { // JWT not valid, req.body.surveyTaker gets undefined
        req.body.surveyTaker = undefined;
        next();
    }
};

module.exports = verifySurveyToken;