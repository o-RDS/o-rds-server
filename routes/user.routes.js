const { initializeApp } = require("firebase/app");
const {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  collection,
} = require("firebase/firestore");
const { getAuth, signInAnonymously } = require("firebase/auth");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
}
initializeApp(firebaseConfig);

const auth = getAuth();
// server could have account info in .env file in future for double security
signInAnonymously(auth);

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
      const userRef = doc(db, "users", req.body.user.email);
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