/* eslint-disable promise/always-return */
/* eslint-disable prefer-promise-reject-errors */
const db = require("../config/firestore");

/**
 * @Param element ProviceName
 */
module.exports.getLov = function(element) {
  return new Promise((resolve, reject) => {
    console.log(element);
    db.collection("lov")
      .where("lovName", "==", element)
      .get()
      .then(docs => {
        console.log(docs[0]);
        if (docs.empty) {
          console.log("No such document!");
          resolve(false);
        } else {
          let resGet ;
          docs.forEach(doc=>{
            resGet = doc.data();
          })
          console.log("Document data:",resGet);
          resolve(resGet);
        }
      })
      .catch(err => {
        console.log("Error getting document", err);
        reject(err);
      });
  });
};
