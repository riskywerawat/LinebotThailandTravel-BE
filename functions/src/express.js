/*********************************** Start import Server  ***********************************/
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require('express-session');
var passport = require("passport");
/*********************************** End import Server   ***********************************/

/*********************************** Start import Line config  ***********************************/
const middleware = require("@line/bot-sdk").middleware;
const JSONParseError = require("@line/bot-sdk").JSONParseError;
const SignatureValidationFailed = require("@line/bot-sdk")
  .SignatureValidationFailed;
const configLine = require("./config/config.json")["line"];
/*********************************** End import Line config  ***********************************/

/*********************************** Start import route  ***********************************/
const webHook = require("../src/webhook/webhook");
const test = require("./test/test");
const webserver = require("./webserver/server");
/*********************************** End import route  ***********************************/

const app = express();
app.use(passport.initialize());
app.use(passport.session());
app.use(
  session({
    secret: "IL<3VEY0U",
    resave: true,
    saveUninitialized: true
  })
);
app.use(cors({
  origin: true
}));
app.use(bodyParser.json());
/**
 * ?test for android and other don't forget to discommit
 */
app.use("/test", test);
app.use("/server", webserver);
/*********************************** Start middle,catch err for line webhook ***********************************/
app.use(middleware(configLine));
app.post("/webhook", webHook);
app.use((err, req, res, next) => {
  if (err instanceof SignatureValidationFailed) {
    res.status(401).send(err.signature);
    return;
  } else if (err instanceof JSONParseError) {
    res.status(400).send(err.raw);
    return;
  }
  next(err); // will throw default 500
});
/*********************************** End middle,catch err for line webhook ***********************************/

module.exports = app;