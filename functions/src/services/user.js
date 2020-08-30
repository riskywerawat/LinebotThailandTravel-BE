/* eslint-disable handle-callback-err */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable promise/always-return */
const db = require("../config/firestore");

module.exports.createUser = function(user) {
  return new Promise((resolve, reject) => {
    let newUser = {
      userId: user.userId,
      action: "non",
      userPriority: 1,
      lastedUse: new Date()
    };

    let User = db.collection("user").doc(newUser.userId);
    User.set(newUser)
      .then(res => {
        resolve(res);
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports.findUser = function(userId) {
  return new Promise((resolve, reject) => {
    db.collection("user")
      .doc(userId)
      .get()
      .then(docs => {
        if (!docs.exists) {
          console.log("No such document!");
          resolve(false);
        } else {
          console.log("Document data:", docs.data());
          resolve(true);
        }
      })
      .catch(err => {
        console.log("Error getting document", err);
        reject(err);
      });
  });
};

module.exports.updateUser = function(element) {
  return new Promise((resolve, reject) => {
    db.collection("user")
      .doc(element.userId)
      .update(element)
      .then(docs => {
        resolve(docs);
      }).catch(err=>{
        reject(err);
      });
  });
};

module.exports.getUser = function(userId){
  return new Promise((resolve, reject) => {
    db.collection("user")
      .doc(userId)
      .get()
      .then(docs => {
        if (!docs.exists) {
          resolve(docs.data());
        } else {
          resolve(docs.data());
        }
      })
      .catch(err => {
        console.log("Error getting document", err);
        reject(err);
      });
  });
}

