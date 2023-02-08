var express = require("express"),
  router = express.Router(),
  {
    signup,
    signin
  } = require("../controllers/auth.controller.js");

  router.post("/register", signup, function (req, res) {

  });


module.exports = router;