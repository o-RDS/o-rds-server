var fs = require('fs');

exports.signup = (req, res) => {

    var user = {
        fullname: req.body.fullname,
        email: req.body.email,
        role: req.body.role,
        password: req.body.password
    };


    saveUserToFolder(user, function(err) {
        if (err) {
            console.log(err);
            res.status(404).send('User not saved');
            return;
        }
        res.status(200).send('User registered successfully');
    });
    

};

exports.signin = (req, res) => {
    fs.readFile(`./users.data/${req.body.email}.json`, (err, data) => {
        if (err) {
            res.status(500).send(err);
            return;
        }

        var user = JSON.parse(data);
        console.log(user);
        // check if user exists. if not, send 404, return
    });

    // user exists

};

function saveUserToFolder(user, callback) {
    fs.writeFile(`./users.data/${user.email}.json`, JSON.stringify(user), callback);
}