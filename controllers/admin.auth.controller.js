var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var fs = require('fs');

exports.register = (req, res) => {

    var user = {
        fullname: req.body.fullname,
        email: req.body.email,
        role: req.body.role,
        password:  bcrypt.hashSync(req.body.password, 8)
    };

    fs.readFile(`./admin.data/${user.email}.json`, (err, data) => {
        if (data != undefined) {
            res.status(409).send({ message: "User already exists." })
            return;
        }
    })

    saveUserToFolder(user, function(err) {
        if (err) {
            console.log(err);
            res.status(404).send({ message: "User not saved." });
            return;
        }
        res.status(200).send({ message: "User registered successfully." });
        console.log("New user registered" );
    });
    
};

exports.login = (req, res) => {
    fs.readFile(`./admin.data/${req.body.email}.json`, (err, data) => {
        if (err) {
            console.log(err);
            res.status(500).send(err);
            return;
        }

        var user = JSON.parse(data);
        if (!user) {
            console.log("User not found");
            return res.status(404).send({
                message: "User not found."
            });
        }

        // compare passwords
        var passwordValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );
        // checking if password was valid and send response accordingly
        if (!passwordValid) {
            console.log("Invalid password");
            return res.status(401)
            .send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }
    
        //signing token with user id
        var token = jwt.sign({
            email: user.email
        }, process.env.JWT_API_SECRET, {
            // in seconds (24 hours)
            expiresIn: 86400
        });

        res.status(200)
        .send({
            user: {
                email: user.email,
                fullname: user.fullname,
                role: user.role
            },
            message: "Login successful",
            accessToken: token
        });
        console.log("User login successful");

    });

};

function saveUserToFolder(user, callback) {
    fs.writeFile(`./admin.data/${user.email}.json`, JSON.stringify(user), callback);
}