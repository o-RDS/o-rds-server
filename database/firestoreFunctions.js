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
};
initializeApp(firebaseConfig);

const auth = getAuth();
// server could have account info in .env file in future for double security
signInAnonymously(auth);

// AUTH FUNCTIONS
async function getUser(userID) {
  const db = getFirestore();
  const docRef = doc(db, "users", userID);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("User does not exist");
      return 404;
    }
  } catch (error) {
    console.log(error);
  }
}

async function postUser(user) {
  const db = getFirestore();
  const docRef = doc(db, "users", user.email);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return 409;
    } else {
      await setDoc(docRef, user);
      return 201;
    }
  } catch (error) {
    console.log(error);
  }
}

// SURVEY FUNCTIONS

async function getSurveyConfigs(userID, index = 0, limit = index + 5) {
  const db = getFirestore();
  const userRef = doc(db, "users", userID);
  let docSnap = await getDoc(userRef);
  try {
    if (docSnap.exists()) {
      var surveyList = [];
      let surveyIDs = docSnap.data().surveys;
      for (var i = index; i < limit; i++) {
        if (i >= surveyIDs.length) {
          break;
        }
        let surveyID = surveyIDs[i];
        const surveyRef = doc(db, "surveys", surveyID);
        let surveySnap = await getDoc(surveyRef);
        if (surveySnap.exists()) {
          surveyList.push(surveySnap.data());
        }
      }
      return surveyList;
    } else {
      console.log("User does not exist");
      return 404;
    }
  } catch (error) {
    console.log(error);
  }
}

async function getSurveyConfig(id) {
  const db = getFirestore();
  const docRef = doc(db, "surveys", id);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("Survey does not exist");
      return 404;
    }
  } catch (error) {
    console.log(error);
  }
}

async function postSurveyConfig(userID, surveyID, surveyData) {
  const db = getFirestore();
  const docRef = doc(db, "surveys", surveyID);
  console.log(`Saving survey ${surveyID} for user ${userID}`);
  try {
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      if (docSnap.data().admins.includes(userID)) {
        console.log("User is admin, updating survey");
        surveyData.lastUpdated = new Date().toLocaleString("en-US", {
          timeZone: "CST",
        });
        setDoc(docRef, surveyData);
        return 201;
      } else {
        console.log("Unauthorized access to survey");
        return 403;
      }
    } else {
      patchSurveyToUser(userID, surveyID);
      setDoc(docRef, surveyData);
      return 201;
    }
  } catch (error) {
    console.log(error);
  }
}

async function deleteSurveyConfig(userID, surveyID) {
  const db = getFirestore();
  const docRef = doc(db, "surveys", surveyID);
  try {
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      if (docSnap.data().admins.includes(userID)) {
        console.log("User is admin, deleting survey");
        for (let admin of docSnap.data().admins) {
          console.log("Removing survey from admin: ", admin);
          await deleteSurveyFromUser(admin, surveyID);
        }
        deleteDoc(docRef);
        return 200;
      } else {
        console.log("Unauthorized access to survey");
        return 403;
      }
    } else {
      console.log("Document does not exist");
      return 404;
    }
  } catch (error) {
    console.log(error);
  }
}

// RESPONSE FUNCTIONS

async function getResponse(surveyID, alias) {
  const db = getFirestore();
  const aliasRef = doc(db, "responses", surveyID, "aliases", alias);
  try {
    let docSnap = await getDoc(aliasRef);
    if (docSnap.exists()) {
      let responseID = docSnap.data().responseID;
      const responseRef = doc(
        db,
        "responses",
        surveyID,
        "surveyResults",
        responseID
      );
      let responseSnap = await getDoc(responseRef);
      if (responseSnap.exists()) {
        return responseSnap.data();
      } else {
        console.log("Response does not exist");
        return 404;
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function getResponses(userID, surveyID) {
  const db = getFirestore();
  const surveyRef = query(
    collection(db, "responses", surveyID, "surveyResults")
  );
  try {
    let docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      if (docSnap.data().admins.includes(userID)) {
        let querySnapshot = await getDocs(surveyRef);
        let allResponses = [];
        querySnapshot.forEach((doc) => {
          allResponses.push(doc.data());
        });
        return allResponses;
      } else {
        console.log("Unauthorized access to survey");
        return 403;
      }
    } else {
      console.log("Survey does not exist");
      return 404;
    }
  } catch (error) {
    console.log(error);
  }
}

async function postResponse(surveyID, alias, response) {
  const db = getFirestore();
  const aliasRef = doc(db, "responses", surveyID, "aliases", alias);
  try {
    let docSnap = await getDoc(aliasRef);
    if (docSnap.exists()) {
      let responseID = docSnap.data().responseID;
      const responseRef = doc(
        db,
        "responses",
        surveyID,
        "surveyResults",
        responseID
      );
      setDoc(responseRef, response);
      if (response.completed) {
        deleteDoc(aliasRef);
      }
      return 201;
    } else {
      console.log("Alias or Survey does not exist");
      return 404;
    }
  } catch (error) {
    console.log(error);
  }
}

// INCENTIVE FUNCTIONS

async function postHash(surveyID, hash) {
  const db = getFirestore();
  const hashRef = doc(db, "responses", surveyID, "incentives", hash);
  try {
    let docSnap = await getDoc(hashRef);
    if (!docSnap.exists()) {
      setDoc(hashRef, {
        isComplete: false,
        completionClaimed: false,
        successfulReferrals: 0,
        claimedReferrals: 0,
      });
      return false;
    } else {
      console.log("Hash already exists");
      return docSnap.data();
    }
  } catch (error) {
    console.log(error);
  }
}

async function getIncentiveInfo(surveyID, hash) {
  const db = getFirestore();
  const hashRef = doc(db, "responses", surveyID, "incentives", hash);
  try {
    let docSnap = await getDoc(hashRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      console.log("Hash does not exist");
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

async function postIncentive(surveyID, hash) {
  const db = getFirestore();
  const hashRef = doc(db, "responses", surveyID, "incentives", hash);
  try {
    let docSnap = await getDoc(hashRef);
    if (docSnap.exists()) {
      let currentData = docSnap.data();
      if (!currentData.isComplete) {
        currentData.isComplete = true;
        setDoc(hashRef, currentData);
      }
      return true;
    } else {
      console.log("Hash does not exist");
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

async function putIncentiveInfo(surveyID, hash, data) {
  const db = getFirestore();
  const hashRef = doc(db, "responses", surveyID, "incentives", hash);
  try {
    let docSnap = await getDoc(hashRef);
    if (docSnap.exists()) {
      let currentData = docSnap.data();
      // checks to prevent updates that would allow a user to claim more than allowed incentives
      if (
        data.isComplete &&
        currentData.claimedReferrals < data.claimedReferrals &&
        currentData.successfulReferrals < data.successfulReferrals &&
        !(
          currentData.completionClaimed === true &&
          data.completionClaimed === false
        )
      ) {
        setDoc(hashRef, data);
      }
      return true;
    } else {
      console.log("Hash does not exist");
      return false;
    }
  } catch (error) {
    console.log(error);
  }
}

// OTHER FUNCTIONS

async function postAlias(surveyID) {
  const db = getFirestore();
  var aliasCreated = false;
  var tries = 0;
  // loops until free alias is found
  while (!aliasCreated && tries < 100) {
    let alias = (Math.floor(Math.random() * 10000) + 10000)
      .toString()
      .substring(1);
    const aliasRef = doc(db, "responses", surveyID, "aliases", alias);
    let docSnap = await getDoc(aliasRef);
    if (!docSnap.exists()) {
      let newID = uuidv4();
      setDoc(aliasRef, { responseID: newID, childResponses: [] });
      aliasCreated = true;
      return { alias: alias, responseID: newID };
    }
    tries++;
  }
  console.log("Failed to create alias");
  return false;
}

async function patchSurveyFromUser(userID, surveyID) {
  const db = getFirestore();
  const userRef = doc(db, "users", userID);
  try {
    let docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      let newData = docSnap.data();
      newData.surveys = newData.surveys.filter((id) => id !== surveyID);
      setDoc(userRef, newData);
      return true;
    } else {
      console.log("Document does not exist");
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function patchSurveyToUser(userID, surveyID) {
  const db = getFirestore();
  const userRef = doc(db, "users", userID);
  try {
    let docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      let newData = docSnap.data();
      newData.surveys.push(surveyID);
      setDoc(userRef, newData);
      return true;
    } else {
      console.log("Document does not exist");
      return false;
    }
  } catch (error) {
    console.log(error);
    return false;
  }
}

module.exports.getUser = getUser;
module.exports.postUser = postUser;
module.exports.getSurveyConfig = getSurveyConfig;
module.exports.getSurveyConfigs = getSurveyConfigs;
module.exports.postSurveyConfig = postSurveyConfig;
module.exports.deleteSurveyConfig = deleteSurveyConfig;
module.exports.getResponse = getResponse;
module.exports.getResponses = getResponses;
module.exports.postResponse = postResponse;
module.exports.postHash = postHash;
module.exports.getIncentiveInfo = getIncentiveInfo;
module.exports.postIncentive = postIncentive;
module.exports.putIncentiveInfo = putIncentiveInfo;
module.exports.postAlias = postAlias;
module.exports.patchSurveyFromUser = patchSurveyFromUser;
module.exports.patchSurveyToUser = patchSurveyToUser;
