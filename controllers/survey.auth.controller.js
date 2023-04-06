var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var fs = require("fs");
var crypto = require("crypto");
require("dotenv").config();

const client = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const TESTING = process.env.TESTING;

exports.verification = (req, res) => {
  // get the phone number from req
  var to = req.body.to;

  // create code and message
  const code = Math.floor(100000 + Math.random() * 900000);
  console.log(code);
  const message = `Hello, your o-RDS verification code is: ${code}`;

  var date = new Date();

  // send them their code
  if (TESTING != "true") {
    try {
      client.lookups.v2
        .phoneNumbers(to)
        .fetch()
        .then((phone_number) => {
          if (phone_number.valid == false) {
            res.status(500).send({ message: "Invalid phone number." });
            return;
          }
          client.messages
            .create({
              body: message,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: phone_number.phoneNumber,
            })
            .then((message) => {
              if (message.error_code == null) {
                // message sent successfully
                // create hash
                const hash = crypto
                  .createHash("sha256")
                  .update(phone_number.phoneNumber)
                  .digest("base64");
                const cleanHash = hash
                  .replaceAll("\\", "x")
                  .replaceAll("/", "y")
                  .replaceAll("+", "z");
                console.log(cleanHash);
                // create survey taker
                var surveyTaker = {
                  hash: cleanHash,
                  code: bcrypt.hashSync(code.toString(), 8),
                  timeCreated: date,
                };
                saveUserToFolder(surveyTaker, function (err) {
                  if (err) {
                    console.log(err);
                    res
                      .status(500)
                      .send({ message: "Survey taker not saved." });
                    return;
                  }
                  res.status(200).send({
                    phoneNumber: phone_number.phoneNumber,
                    message:
                      "Survey taker registered successfully. Verification code has been sent.",
                  });
                  console.log("New survey taker registered");
                });
              } else {
                // Twilio error
                res.status(500).send({ message: message.error_message });
              }
            });
        });
    } catch (error) {
      console.log(error);
      res.status(500).send({ message: "Twilio message error.", error: error });
    }
  } else {
    console.log("Verification in TESTING MODE");
    saveUserToFolder(surveyTaker, function (err) {
      if (err) {
        console.log(err);
        res.status(500).send({ message: "Survey taker not saved." });
        return;
      }
      res.status(200).send({
        message: `Survey taker registered successfully. Verification code is ${code}.`,
        code: code,
      });
      console.log("New survey taker registered");
    });
  }
};

exports.verificationCheck = (req, res) => {
  // hash the phone number
  const hash = crypto.createHash("sha256").update(req.body.to).digest("base64");
  const cleanHash = hash
    .replaceAll("\\", "x")
    .replaceAll("/", "y")
    .replaceAll("+", "z");
  fs.readFile(`./survey.data/${cleanHash}.json`, (err, data) => {
    if (err) {
      console.log(err);
      res.status(500).send(err);
      return;
    }

    var surveyTaker = JSON.parse(data);
    if (!surveyTaker) {
      console.log("Survey taker not found");
      return res.status(404).send({
        message: "Survey taker not found.",
      });
    }

    // compare codes
    var codeValid = bcrypt.compareSync(req.body.code, surveyTaker.code);

    // checking if code was valid and send response accordingly
    if (!codeValid) {
      console.log("Invalid code");
      return res.status(401).send({
        accessToken: null,
        message: "Invalid code!",
      });
    }

    //signing token with phone hash
    var token = jwt.sign(
      {
        hash: surveyTaker.hash,
      },
      process.env.JWT_API_SECRET,
      {
        // in seconds (2 hours)
        expiresIn: 7200,
      }
    );

    res.status(200).send({
      message: "Survey taker verification successful",
      accessToken: token,
    });
    fs.unlink(`./survey.data/${cleanHash}.json`, (err) => {
      if (err) {
        throw err;
      }
      console.log("Used OTP Cleared successfully.");
    });
    console.log("Survey taker verification successful");
  });
};

function saveUserToFolder(surveyTaker, callback) {
  fs.writeFile(
    `./survey.data/${surveyTaker.hash}.json`,
    JSON.stringify(surveyTaker),
    callback
  );
}
