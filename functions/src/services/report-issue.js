/* eslint-disable promise/always-return */
const db = require("../config/firestore");
/**
 * @param issue_message: String
 */
module.exports.sendIssue = issue_message => {
  return new Promise((resolve, reject) => {
    let newIssue = {
      issue_message: issue_message,
      issue_status: "incoming",
      createBy: "line_user",
      createAt: new Date().toISOString()
    };
    console.log(JSON.stringify(newIssue));
    let Issue = db.collection("issue").doc();
    Issue.set(newIssue)
      .then(res => {
        console.log(res);
        resolve("Report bug complete");
      })
      .catch(err => {
        reject(err);
      });
  });
};

module.exports.putIssue = issue_message => {
  return new Promise((resolve, reject) => {
    console.log(JSON.stringify(issue_message));
    // db.collection("issue").doc().id;
    resolve(db.collection("issue").doc().id);
      // .where("issue_message", "==", issue_message.issue_message)
      // .get()
      // .then(docs => {
      //   if (docs.empty) {
      //     console.log("No such document!");
      //     resolve(false);
      //   } else {
      //     db.collection("issue").doc(docs[0].id).update(issue_message)
      //     console.log("Document data:", res);
      //     resolve(res);
      //   }
      // })
      // .catch(err => {
      //   console.log("Error getting document", err);
      //   reject(err);
      // });
  });
};
