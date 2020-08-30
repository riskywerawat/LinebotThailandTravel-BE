/* eslint-disable handle-callback-err */
/* eslint-disable promise/no-nesting */
/* eslint-disable promise/catch-or-return */
/* eslint-disable promise/always-return */
const line = require("@line/bot-sdk");
const configLine = require("../config/config.json")["line"];
const handle = require("../services/handle-event");
const userService = require("../services/user");
const client = new line.Client(configLine);

module.exports = async (req, res) => {
  //test line
  if (req.body.events[0].replyToken === "00000000000000000000000000000000") {
    console.debug("Test pass");
    return res.status(200).send("Code:200,Message:Test");
  }

  var event = req.body.events[0];
  console.log("event"+JSON.stringify(event));
  try {
    let user = await userService.getUser(event.source.userId);
    if (!user) {
      user = userService.createUser(event.source);
    }
    console.log("user detail"+JSON.stringify(user));
    let resHandle = await handle.handleEvent(event, user);
    await console.log("Result =>", JSON.stringify(resHandle[1]));
    await client.replyMessage(resHandle[0], resHandle[1])
    return res.status(200).send("Code:200");
  } catch (err) {
    console.error("Error message =>", err.message);
    return res.status(500).send("Code:500");
  }
};
