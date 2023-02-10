var express = require("express"),
verifyToken = require("../middlewares/authJWT");
router = express.Router(),
{
  signup,
  signin
} = require("../controllers/auth.controller");

router.post("/register", signup, function (req, res) {

});

router.post('/login', signin, function(req, res) {

});

// just an example
router.get("/hiddencontent", verifyToken, function (req, res) {
  console.log(req.body);
  if (req.body.user == undefined) {
    res.status(403)
      .send({
        message: "Invalid JWT token"
      });
  }
  else if (req.body.user.role == "admin") {
    res.status(200)
      .send({
        message: "Congratulations! but there is no hidden content"
      });
  } else {
    res.status(403)
      .send({
        message: "Unauthorised access"
      });
  }
});

module.exports = router;