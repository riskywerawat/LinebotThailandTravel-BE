/* eslint-disable promise/always-return */
const functions = require("firebase-functions");
const express = require("./src/express");

exports.linebot = functions.https.onRequest(express);
