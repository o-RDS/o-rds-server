var jwt = require("jsonwebtoken");
var bcrypt = require("bcrypt");
var fs = require("fs");
const { getUser, postUser } = require("../database/firestoreFunctions.js");

exports.register = async (req, res) => {
  if (
    !req.body.fullname ||
    !req.body.email ||
    !req.body.password ||
    !req.body.role
  ) {
    console.log("Missing fields");
    res.status(400).send({ message: "Missing fields" });
    return;
  }

  var user = {
    fullname: req.body.fullname,
    email: req.body.email,
    role: req.body.role,
    password: bcrypt.hashSync(req.body.password, 8),
    surveys: [],
  };

  let status = await postUser(user);
  if (status === 201) {
    console.log("User created");
    res.status(201).send({ message: "User created" });
    return;
  } else if (status === 409) {
    console.log("User already exists");
    res.status(409).send({ message: "User already exists" });
    return;
  } else {
    console.log("Internal server error");
    res.status(500).send({ message: "Internal server error" });
    return;
  }
};

exports.login = async (req, res) => {
  user = await getUser(req.body.email);
  if (user === undefined) {
    console.log("Internal server error");
    res.status(500).send({ message: "Internal server error" });
    return;
  }
  else if (user === 404) {
    console.log("User not found");
    res.status(404).send({ message: "Email and password combination invalid." });
    return;
  }

  // compare passwords
  var passwordValid = bcrypt.compareSync(req.body.password, user.password);
  // checking if password was valid and send response accordingly
  if (!passwordValid) {
    console.log("Invalid password");
    return res.status(404).send({
      message: "Email and password combination invalid.",
    });
  }

  //signing token with user id
  var token = jwt.sign(
    {
      email: user.email,
    },
    process.env.JWT_API_SECRET,
    {
      // in seconds (24 hours)
      expiresIn: 86400,
    }
  );

  res.status(200).send({
    user: {
      email: user.email,
      fullname: user.fullname,
      role: user.role,
    },
    message: "Login successful",
    accessToken: token,
  });
  console.log("User login successful");
};
