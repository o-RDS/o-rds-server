const jwt = require("jsonwebtoken");
var fs = require('fs');
var crypto = require('crypto');

const verifySurveyToken = (req, res, next) => {
    // checking validity of JWT
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_API_SECRET, function (err, decode) {
            if (err) {
                console.log(err);
                req.body.user = undefined;
                next();
            }
            // if valid, add user data onto req.body
            else {
              if (decode.hash === undefined) {
                req.body.user = { hash: decode.hash };
                next();
              } else {
                req.body.user = undefined;
                next();
              }
            }
        });
    } else { // JWT not valid, req.body.surveyTaker gets undefined
        req.body.user = undefined;
        next();
    }
};

module.exports = verifySurveyToken;