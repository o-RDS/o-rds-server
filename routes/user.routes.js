var express = require("express"),
verifyAdminToken = require("../middlewares/admin.JWT.auth");
router = express.Router(),
{
  register,
  login
} = require("../controllers/admin.auth.controller");

router.post("/register", register, function (req, res) {

});

router.post('/login', login, function(req, res) {

});

// just an example
router.get("/hiddencontent", verifyAdminToken, function (req, res) {
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
        message: "Unauthorized access"
      });
  }
});

module.exports = router;