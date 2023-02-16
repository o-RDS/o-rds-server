const jwt = require("jsonwebtoken");
var fs = require('fs');

const verifyAdminToken = (req, res, next) => {
    // checking validity of JWT
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_API_SECRET, function (err, decode) {
        if (err) {
            console.log(err);
            req.body.user = undefined;
        }
        // if valid, add user data onto req.body
        fs.readFile(`./admin.data/${req.body.email}.json`, (err, data) => {
            if (err) {
                console.log(err);
                res.status(404).send({
                    message: "User not found. Body must contain email and password."
                });
            } else {
                var user = JSON.parse(data);
                req.body.user = user;
                next();
            }
        });
        });
    } else { // JWT not valid, req.body.user gets undefined
        req.body.user = undefined;
        next();
    }
};

module.exports = verifyAdminToken;