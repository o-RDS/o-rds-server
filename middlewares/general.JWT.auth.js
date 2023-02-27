const jwt = require("jsonwebtoken");
var fs = require("fs");
const { getUser } = require("../database/firestoreFunctions");

const verifyToken = (req, res, next) => {
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
          console.log(req.ip + "JWT Malformed");
          res.status(403).send({
            message: "JWT Malformed",
          });
        } else if (decode === undefined) {
          console.log(req.ip + " Bad Account");
          res.status(403).send({
            message: "Bad Account",
          });
        } else if (decode.hash != undefined) {
          req.body.user = { hash: decode.hash };
          next();
        } else {
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
        }
      }
    );
  } else {
    res.status(403).send({
      message: "JWT Malformed",
    });
  }
};

module.exports = verifyToken;
