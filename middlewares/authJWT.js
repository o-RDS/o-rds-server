const jwt = require("jsonwebtoken");
var fs = require('fs');

const verifyToken = (req, res, next) => {
    if (req.headers && req.headers.authorization && req.headers.authorization.split(' ')[0] === 'JWT') {
        jwt.verify(req.headers.authorization.split(' ')[1], process.env.JWT_API_SECRET, function (err, decode) {
        if (err) {
            console.log(err);
            req.body.user = undefined;
        }
        fs.readFile(`./users.data/${req.body.email}.json`, (err, data) => {
            if (err) {
                console.log(err);
                res.status(500).send(err);
            } else {
                var user = JSON.parse(data);
                req.body.user = user;
                next();
            }
        });
        });
    } else {
        req.body.user = undefined;
        next();
    }
};

module.exports = verifyToken;