const {
  getSurveyConfig,
  getSurveyConfigs,
  postSurveyConfig,
  deleteSurveyConfig,
  getResponse,
  getResponses,
  postResponse,
  postHash,
  getIncentiveInfo,
  postIncentive,
  putIncentiveInfo,
  postAlias,
  deleteSurveyFromUser,
  patchSurveyToUser
} = require('../database/databaseFunctions.js');
var express = require("express"),
  verifyAdminToken = require("../middlewares/admin.JWT.auth");
router = express.Router(),
  {
    register,
    login
  } = require("../controllers/admin.auth.controller");

function gotJWT(req, res, next) {
  if (req.body.user == undefined) {
    res.status(403)
      .send({
        message: "Invalid JWT token"
      });
  } else {
    next();
  }
}

// AUTH ROUTES

router.post("/register", register, function (req, res) {
});

router.post('/login', login, function (req, res) {
});

// SURVEY ROUTES

router.get("/api/survey", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.surveyID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID"
      });
  }
  else {
    let result = await getSurveyConfig(req.body.surveyID);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else if (result == 404) {
      res.status(404)
        .send({
          message: "Survey does not exist"
        });
    } else {
      res.status(200)
        .send(
          result
        );
    }
  }
});

router.get("/api/surveys", verifyAdminToken, gotJWT, async function (req, res) {
  if (req.body.user.role == "admin") {
    if (req.body.index == undefined) {
      req.body.index = 0;
    }
    if (req.body.limit == undefined) {
      req.body.limit = req.body.index + 5;
    }
    let result = await getSurveyConfigs(req.body.user.email, req.body.index, req.body.limit);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else if (result == 404) {
      res.status(404)
        .send({
          message: "User does not exist"
        });
    } else {
      res.status(200)
        .send(
          result
        );
    }
  } else {
    res.status(403)
      .send({
        message: "Unauthorized access"
      });
  }
});

router.post("/api/survey", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.user.role == "admin") {
    if (req.body.surveyID == undefined || req.body.surveyData == undefined) {
      res.status(400)
        .send({
          message: "Invalid request, missing surveyID or data"
        });
    }
    else {
      let result = await postSurveyConfig(req.body.user.email, req.body.surveyID, req.body.surveyData);
      if (result == undefined) {
        res.status(500)
          .send({
            message: "Internal Server Error"
          });
      }
      else if (result == 403) {
        res.status(403)
          .send({
            message: "Unauthorized access, not your survey"
          });
      }
      else {
        res.status(201)
          .send({
            message: "Survey created or overwritten"
          });
      }
    }
  } else {
    res.status(403)
      .send({
        message: "Unauthorized access, not an admin"
      });
  }
});

router.delete("/api/survey", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.user.role == "admin") {
    if (req.body.surveyID == undefined) {
      res.status(400)
        .send({
          message: "Invalid request, missing surveyID"
        });
    }
    else {
      let result = await deleteSurveyConfig(req.body.user.email, req.body.surveyID);
      if (result == undefined) {
        res.status(500)
          .send({
            message: "Internal Server Error"
          });
      }
      else if (result == 403) {
        res.status(403)
          .send({
            message: "Unauthorized access, not your survey"
          });
      }
      else if (result == 404) {
        res.status(404)
          .send({
            message: "Survey does not exist"
          });
      }
      else {
        res.status(200)
          .send({
            message: "Survey deleted"
          });
      }
    }
  } else {
    res.status(403)
      .send({
        message: "Unauthorized access, not an admin"
      });
  }
});

// RESPONSE ROUTES

router.get("/api/response", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.alias == undefined || req.body.surveyID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing alias or surveyID"
      });
  }
  else {
    let result = await getResponse(req.body.surveyID, req.body.alias);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else if (result == 404) {
      res.status(404)
        .send({
          message: "Response does not exist"
        });
    } else {
      res.status(200)
        .send(
          result
        );
    }
  }
});

router.get("/api/responses", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.surveyID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID"
      });
  }
  else {
    let result = await getResponses(req.body.user.email, req.body.surveyID);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else if (result == 403) {
      res.status(403)
        .send({
          message: "Unauthorized access, not your survey"
        });
    }
    else if (result == 404) {
      res.status(404)
        .send({
          message: "Survey does not exist"
        });
    } else {
      res.status(200)
        .send(
          result
        );
    }
  }
});

router.post("/api/response", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.surveyID == undefined || req.body.alias == undefined || req.body.responseData == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID, alias, or responseData"
      });
  }
  else {
    let result = await postResponse(req.body.surveyID, req.body.alias, req.body.responseData);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else if (result == 404) {
      res.status(404)
        .send({
          message: "Survey or alias does not exist"
        });
    } else {
      res.status(201)
        .send({
          message: "Response created or overwritten"
        });
    }
  }
});

module.exports = router;