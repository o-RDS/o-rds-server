import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  collection,
} from "firebase/firestore";
import { getAuth, signInAnonymously } from "firebase/auth";
import { v4 as uuidv4 } from "uuid";
import { firebaseConfig } from "../.firebase.js";
// Initialize Firebase
initializeApp(firebaseConfig);

const auth = getAuth();
// server could have account info in .env file in future for double security
signInAnonymously(auth);

var express = require("express"),
  verifyAdminToken = require("../middlewares/admin.JWT.auth");
router = express.Router(),
  {
    signup,
    signin
  } = require("../controllers/admin.auth.controller");

router.post("/register", signup, function (req, res) {

});

router.post('/login', signin, function (req, res) {

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

router.get("/api/admin/surveys", verifyAdminToken, async function (req, res) {
  console.log(req.body);
  if (req.body.user == undefined) {
    res.status(403)
      .send({
        message: "Invalid JWT token"
      });
  }
  else if (req.body.user.role == "admin") {
    try {
      const db = getFirestore();
      const userRef = doc(db, "users", req.body.userID);
      let docSnap = await getDoc(userRef);
      if (docSnap.exists()) {
        var surveyList = []
        let surveyIDs = docSnap.data().surveys
        for (var i = req.body.index; i < req.body.limit; i++) {
          if (i >= surveyIDs.length) {
            break;
          }
          let surveyID = surveyIDs[i];
          const surveyRef = doc(db, "surveys", surveyID);
          let surveySnap = await getDoc(surveyRef);
          if (surveySnap.exists()) {
            surveyList.push(surveySnap.data());
          }
        };
        res.status(200)
        .send({
          message: surveyList
        });
      } else {
        res.status(400)
        .send({
          message: "User does not exist"
        });
      }
    } catch (error) {
      res.status(400)
        .send({
          message: "Bad Request"
        });
    }
  } else {
    res.status(403)
      .send({
        message: "Unauthorized access"
      });
  }
});

module.exports = router;