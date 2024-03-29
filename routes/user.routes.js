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
const { createAccountLimiter } =  require("../middlewares/rateLimit");

// AUTH ROUTES

router.post("/api/register", createAccountLimiter, register, function (req, res) {
  console.log(req.ip ` POST /api/register`)
});

router.post('/api/login', login, function (req, res) {
  console.log(req.ip ` POST /api/login`)
});

// SURVEY ROUTES

router.get("/api/survey/:surveyID", async function (req, res) {
  console.log(req.ip + ` GET /api/survey/${req.params.surveyID}`);
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

router.get("/api/surveys", verifyAdminToken, async function (req, res) {
  console.log(req.ip + " GET /api/surveys")
  if (req.body.user.role == "admin") {
    if (req.query.index == undefined) {
      req.query.index = 0;
    }
    if (req.query.count == undefined) {
      req.query.count = 5;
    }
    let result = await getSurveyConfigs(req.body.user.email, parseInt(req.query.index), parseInt(req.query.count));
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

router.post("/api/survey/:surveyID", verifyAdminToken, async function (req, res) {
  console.log(req.ip + ` POST /api/survey/${req.params.surveyID}`)
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

router.delete("/api/survey/:surveyID", verifyAdminToken, async function (req, res) {
  console.log(req.ip + ` DELETE /api/survey/${req.params.surveyID}`)
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

router.get("/api/survey/:surveyID/response/:alias", verifySurveyToken, async function (req, res) {
  console.log(req.ip + ` GET /api/survey/${req.params.surveyID}/response/${req.params.alias}`)
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

router.get("/api/survey/:surveyID/responses", verifyAdminToken, async function (req, res) {
  console.log(req.ip + ` GET /api/survey/${req.params.surveyID}/responses`)
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

router.post("/api/response", verifySurveyToken, async function (req, res) {
  console.log(req.ip + ` POST /api/response`)
  if (req.body.surveyID == undefined || req.body.alias == undefined || req.body.responseData == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID, alias, or responseData"
      });
  }
  else {
    let result = await postResponse(req.body.surveyID, req.body.alias, req.body.responseData, req.body.user.hash, req.body.parentHash);
    console.log("Response Post: " + result)
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
    }
    else if (result == 409) {
      res.status(409)
        .send({
          message: "Referral Link At Max Uses"
        });
    }
    else if (result == 403) {
      res.status(403)
        .send({
          message: "Referer has not completed survey"
        });
    }
    else if (result == 201) {
      res.status(201)
        .send({
          message: "Response created or overwritten"
        });
    } else {
      res.status(500)
        .send({
          message: "Server Error"
        });
    }
  }
});

router.delete("/api/response", verifyAdminToken, async function (req, res) {
  console.log(req.ip + ` DELETE /api/response`)
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

router.post("/api/incentive", verifySurveyToken, async function (req, res) {
  console.log(req.ip + ` POST /api/incentive`)
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
    else if (result == 201) {
      res.status(201)
        .send({
          message: "Hash created"
        });
    }
    else {
      res.status(409)
        .send(result);
    }
  }
});

router.get("/api/survey/:surveyID/incentive", verifySurveyToken, async function (req, res) {
  console.log(req.ip + ` GET /api/survey/${req.params.surveyID}/incentive`)
  if (req.params.surveyID == undefined) {
    res.status(400)
      .send({
        message: "Invalid request, missing surveyID"
      });
  }
  else {
    let result = await getIncentiveInfo(req.params.surveyID, req.body.user.hash);
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

router.put("/api/incentive", verifySurveyToken, async function (req, res) {
  //TODO
});

// OTHER ROUTES

router.post("/api/alias", verifySurveyToken, async function (req, res) {
  console.log(req.ip + ` POST /api/alias`)
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

router.patch("/api/user-remove", verifyAdminToken, async function (req, res) {
  console.log(req.ip + ` PATCH /api/user-remove`)
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

router.patch("/api/user-add", verifyAdminToken, async function (req, res) {
  console.log(req.ip + ` PATCH /api/user-add`)
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