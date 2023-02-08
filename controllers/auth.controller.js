var User = require("../models/user")

exports.signup = (req, res) => {
    console.log(req.body);
    const user = new User({
        fullName: req.body.fullName,
        email: req.body.email,
        role: req.body.role,
        // password: bcrypt.hashSync(req.body.password, 8)
        password: req.body.password
    });

    console.log(user);
};