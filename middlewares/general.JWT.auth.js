const jwt = require("jsonwebtoken");
var fs = require('fs');

const verifyToken = (req, res, next) => {
    // checking validity of JWT
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_API_SECRET, function (err, decode) {
            if (err) {
                console.log(err);
                req.body.user = undefined;
                next();
            }
            if (decode.hash != undefined) {
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
            } else {
                fs.readFile(`./admin.data/${decode.email}.json`, (err, data) => {
                    if (err) {
                        console.log(err);
                        res.status(404).send({
                            message: "User not found."
                        });
                    } else {
                        var user = JSON.parse(data);
                        req.body.user = user;
                        next();
                    }
                });
            }
        });
    } else { // JWT not valid, req.body.user gets undefined
        req.body.user = undefined;
        next();
    }
};

module.exports = verifyToken;