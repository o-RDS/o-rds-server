var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var fs = require('fs');
var crypto = require('crypto');
require("dotenv").config();

const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const TESTING = process.env.TESTING;

exports.verification = (req, res) => {

    // get the phone number from req
    var to = req.body.to;

    // hash the phone number
    const hash = crypto.createHash('sha256').update(to).digest('base64');

    // create code and message
    const code = Math.floor(100000 + Math.random() * 900000);
    console.log(code);
    const message = `Hello, your o-RDS verification code is: ${code}`;


    var date = new Date();
    // create survey taker 
    var surveyTaker = {
        hash: hash,
        code: bcrypt.hashSync(code.toString(), 8),
        timeCreated: date
    };

    // send them their code
    if (!TESTING) {
        client.messages
            .create({ body: message, from: process.env.TWILIO_PHONE_NUMBER, to: to })
            .then(message => {
                if (message.error_code == null) { // message sent successfully
                    saveUserToFolder(surveyTaker, function (err) {
                        if (err) {
                            console.log(err);
                            res.status(500).send({ message: "Survey taker not saved." });
                            return;
                        }
                        res.status(200).send({ message: "Survey taker registered successfully. Verification code has been sent." });
                        console.log("New survey taker registered");
                    })
                } else { // Twilio error
                    res.status(500).send({ message: message.error_message });
                }
            });
    } else {
        console.log("Verification in TESTING MODE")
        saveUserToFolder(surveyTaker, function (err) {
            if (err) {
                console.log(err);
                res.status(500).send({ message: "Survey taker not saved." });
                return;
            }
            res.status(200).send({ message: `Survey taker registered successfully. Verification code is ${code}.` });
            console.log("New survey taker registered");
        })
    }

};

exports.verificationCheck = (req, res) => {

    // hash the phone number
    const hash = crypto.createHash('sha256').update(req.body.to).digest('base64');
    const cleanHash = hash.replace(/[\\\/+]/g, '');
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
                message: "Survey taker not found."
            });
        }

        // compare codes
        var codeValid = bcrypt.compareSync(
            req.body.code,
            surveyTaker.code
        );

        // checking if code was valid and send response accordingly
        if (!codeValid) {
            console.log("Invalid code");
            return res.status(401)
                .send({
                    accessToken: null,
                    message: "Invalid code!"
                });
        }

        //signing token with phone hash
        var token = jwt.sign({
            hash: surveyTaker.hash
        }, process.env.JWT_API_SECRET, {
            // in seconds (2 hours)
            expiresIn: 7200
        });

        res.status(200)
            .send({
                message: "Survey taker verification successful",
                accessToken: token
            });
        console.log("Survey taker verification successful");

    });

};

function saveUserToFolder(surveyTaker, callback) {
    const cleanHash = surveyTaker.hash.replace(/[\\\/+]/g, '');
    fs.writeFile(`./survey.data/${cleanHash}.json`, JSON.stringify(surveyTaker), callback);
}

