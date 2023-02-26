const {
  getSurveyConfig,
  getSurveyConfigs,
  postSurveyConfig,
  deleteSurveyConfig,
  getResponse,
  getResponses,
  postResponse,
  getIncentiveInfo,
  postAlias,
  patchSurveyFromUser,
  patchSurveyToUser,
  postIncentive
} = require('../database/firestoreFunctions.js');
var express = require("express"),
  verifyAdminToken = require("../middlewares/admin.JWT.auth"),
  verifySurveyToken = require('../middlewares/survey.JWT.auth.js'),
  verifyToken = require("../middlewares/general.JWT.auth");
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

router.post("/api/register", register, function (req, res) {
});

router.post('/api/login', login, function (req, res) {
});

// SURVEY ROUTES

router.get("/api/survey/:surveyID", async function (req, res) {
  //console.log(req.body);
  let result = await getSurveyConfig(req.params.surveyID);
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
});

router.get("/api/surveys", verifyAdminToken, gotJWT, async function (req, res) {
  if (req.body.user.role == "admin") {
    if (req.query.index == undefined) {
      req.query.index = 0;
    }
    if (req.query.limit == undefined) {
      req.query.limit = req.query.index + 5;
    }
    let result = await getSurveyConfigs(req.body.user.email, req.query.index, req.query.limit);
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

router.post("/api/survey/:surveyID", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.user.role == "admin") {
    if (req.params.surveyID == undefined || req.body.surveyData == undefined) {
      res.status(400)
        .send({
          message: "Invalid request, missing surveyID or data"
        });
    }
    else {
      let result = await postSurveyConfig(req.body.user.email, req.params.surveyID, req.body.surveyData);
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

router.delete("/api/survey/:surveyID", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.user.role == "admin") {
    if (req.params.surveyID == undefined) {
      res.status(400)
        .send({
          message: "Invalid request, missing surveyID"
        });
    }
    else {
      let result = await deleteSurveyConfig(req.body.user.email, req.params.surveyID);
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

router.get("/api/survey/:surveyID/response/:alias", verifySurveyToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.params.alias == undefined || req.params.surveyID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing alias or surveyID"
      });
  }
  else {
    let result = await getResponse(req.params.surveyID, req.params.alias);
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

router.get("/api/survey/:surveyID/responses", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.params.surveyID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID"
      });
  }
  else {
    let result = await getResponses(req.body.user.email, req.params.surveyID);
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

router.post("/api/response", verifySurveyToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.surveyID == undefined || req.body.alias == undefined || req.body.responseData == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID, alias, or responseData"
      });
  }
  else {
    let result = await postResponse(req.body.surveyID, req.body.alias, req.body.responseData, req.body.user.hash);
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

router.delete("/api/response", verifyAdminToken, gotJWT, async function (req, res) {
  //console.log(req.body);
  if (req.body.surveyID == undefined || req.body.responseID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID or responseID"
      });
  }
  else {
    let result = await deleteResponse(req.body.user.email, req.body.surveyID, req.body.alias);
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
          message: "Response or survey does not exist"
        });
    }
    else {
      res.status(200)
        .send({
          message: "Response deleted"
        });
    }
  }
});

// INCENTIVE ROUTES

router.post("/api/incentive", verifySurveyToken, gotJWT, async function (req, res) {
  if (req.body.surveyID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID"
      });
  }
  else {
    let result = await postIncentive(req.body.surveyID, req.body.user.hash);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else if (result == 409) {
      res.status(409)
        .send({
          message: "Hash already exists"
        });
    } else {
      res.status(201)
        .send({
          message: "Hash created"
        });
    }
  }
});

router.get("/api/survey/:surveyID/incentive", verifySurveyToken, gotJWT, async function (req, res) {
  if (req.body.surveyID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID"
      });
  }
  else {
    let result = await getIncentiveInfo(req.body.surveyID, req.body.user.hash);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else if (result == 404) {
      res.status(404)
        .send({
          message: "Hash does not exist"
        });
    } else {
      res.status(200)
        .send(result);
    }
  }
});

router.put("/api/incentive", verifySurveyToken, gotJWT, async function (req, res) {
  //TODO
});

// OTHER ROUTES

router.post("/api/alias", verifySurveyToken, gotJWT, async function (req, res) {
  console.log(req.body);
  if (req.body.surveyID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID"
      });
  }
  else {
    let result = await postAlias(req.body.surveyID);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else {
      res.status(201)
        .send(result);
    }
  }
});

router.patch("/api/user-remove", verifyAdminToken, gotJWT, async function (req, res) {
  if (req.body.surveyID == undefined || req.body.email == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID or email"
      });
  }
  else {
    let result = await patchSurveyFromUser(req.body.email, req.body.surveyID);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else if (result == 404) {
      res.status(404)
        .send({
          message: "User or survey does not exist"
        });
    }
  }
});

router.patch("/api/user-add", verifyAdminToken, gotJWT, async function (req, res) {
  if (req.body.surveyID == undefined || req.body.email == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID or email"
      });
  }
  else {
    let result = await patchSurveyToUser(req.body.email, req.body.surveyID);
    if (result == undefined) {
      res.status(500)
        .send({
          message: "Internal Server Error"
        });
    }
    else if (result == 404) {
      res.status(404)
        .send({
          message: "User or survey does not exist"
        });
    }
  }
});

module.exports = router;