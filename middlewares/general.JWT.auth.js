const jwt = require("jsonwebtoken");
var fs = require('fs');
const { getUser } = require("../database/firestoreFunctions");

const verifyToken = (req, res, next) => {
    // checking validity of JWT
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_API_SECRET, async function (err, decode) {
            console.log(decode)
            if (err) {
                console.log(err);
                req.body.user = undefined;
                next();
            }
            else if (decode === undefined) {
                req.body.user = undefined;
                next();
            }
            else if (decode.hash != undefined) {
                req.body.user = { hash: decode.hash };
                next();
            } else {
                user = await getUser(decode.email);
                if (user === undefined) {
                    req.body.user = undefined;
                    next();
                } else if (user === 404) {
                    console.log("User not found");
                    req.body.user = undefined;
                    next();
                } else {
                    req.body.user = user;
                    next();
                }
            }
        });
    } else { // JWT not valid, req.body.user gets undefined
        req.body.user = undefined;
        next();
    }
};

module.exports = verifyToken;