const jwt = require("jsonwebtoken");
var fs = require('fs');
var crypto = require('crypto');

const verifySurveyToken = (req, res, next) => {
    // checking validity of JWT
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_API_SECRET, function (err, decode) {
            if (err) {
                console.log(err);
                req.body.surveyTaker = undefined;
                next();
            }

            // if valid, add user data onto req.body
            fs.readFile(`./survey.data/${decode.hash}.json`, (err, data) => {
                if (err) {
                    console.log(err);
                    res.status(404).send({
                        message: "Survey taker not found."
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