const jwt = require("jsonwebtoken");
var fs = require("fs");
var crypto = require("crypto");

const verifySurveyToken = (req, res, next) => {
  // checking validity of JWT
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_API_SECRET,
      function (err, decode) {
        if (err) {
          console.log(req.ip + "JWT Malformed");
          res.status(403).send({
            message: "JWT Malformed",
          });
        }
        // if valid, add user data onto req.body
        else {
          if (decode.hash !== undefined) {
            req.body.user = { hash: decode.hash };
            next();
          } else {
            console.log(req.ip + " Wrong Account Type");
            res.status(403).send({
              message: "Wrong Account Type",
            });
          }
        }
      }
    );
  } else {
    // JWT not valid
    console.log(req.ip + "JWT Malformed");
    res.status(403).send({
      message: "JWT Malformed",
    });
  }
};

module.exports = verifySurveyToken;
