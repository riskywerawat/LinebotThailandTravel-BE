/*********************************** Start import Firebase Firestore config ***********************************/
const firebase = require("firebase");
const configFirestore = require('../config/config.json')['firestore'];
/*********************************** End import Firebase Firestore config ***********************************/

const fireBase = firebase.initializeApp(configFirestore);
const db = fireBase.firestore();

module.exports = db