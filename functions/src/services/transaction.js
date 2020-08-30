module.exports.addTransaction = function(action) {
  return new Promise((resolve, reject) => {
    let transaction;
    if (action === "richmenu_hotel") {
      let transaction = searchHotel;
      transaction.action = action;
      resolve(transaction);
    } else if (action === "richmenu_bus") {
      let transaction = sortBus;
      transaction.action = action;
      resolve(transaction);
    } else if (action === "richmenu_restaurant") {
      let transaction = searchRestaurant;
      transaction.action = action;
      resolve(transaction);
    } else if (action === "richmenu_tourist") {
      let transaction = searchTourist;
      transaction.action = action;
      resolve(transaction);
    } else {
      resolve({});
    }
  });
};

module.exports.addIssueTransaction = () => {
  let newIssue = {};
  newIssue.action = "report_issue";
  newIssue.timeStamp = new Date();
  return newIssue;
};

let searchHotel = {
  location: "",
  action: "",
  timeStamp: new Date(),
  isComplete: false
};

let sortBus = {
  action: "",
  origin: null,
  destination: null,
  isComplete: false,
  timeStamp: new Date()
};

let searchRestaurant = {
  location: "",
  action: "",
  isComplete: false,
  timeStamp: new Date()
};

let searchTourist = {
  location: "",
  action: "",
  isComplete: false,
  timeStamp: new Date()
};
