const jwt = require("jsonwebtoken");
var fs = require("fs");
const { getUser } = require("../database/firestoreFunctions");

const verifyAdminToken = (req, res, next) => {
  // checking validity of JWT
  if (
    req.headers &&
    req.headers.authorization &&
    req.headers.authorization.split(" ")[0] === "JWT"
  ) {
    jwt.verify(
      req.headers.authorization.split(" ")[1],
      process.env.JWT_API_SECRET,
      async function (err, decode) {
        if (err) {
          console.log(req.ip + " JWT Malformed");
          res.status(403).send({
            message: "JWT Malformed",
          });
        }
        // if valid, add user data onto req.body
        else if (decode != undefined && decode.email != undefined) {
          user = await getUser(decode.email);
          if (user === undefined) {
            console.log(req.ip + " Internal Server Error");
            res.status(500).send({
              message: "Internal Server Error",
            });
          } else if (user === 404) {
            console.log(req.ip + " User not found");
            res.status(404).send({
              message: "User not found",
            });
          } else {
            req.body.user = user;
            next();
          }
        } else {
          console.log(req.ip + " Wrong Account Type");
          res.status(403).send({
            message: "Wrong Account Type",
          });
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

module.exports = verifyAdminToken;
