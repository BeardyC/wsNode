"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../typings/index.d.ts" />
var express = require("express");
var fs = require("fs");
var https = require("https");
var body = require("body-parser");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var app = express();
app.use(body.urlencoded({ extended: false }));
app.use(body.json());
var privateKey = fs.readFileSync("../keyscerts/privkey.pem", "utf8");
var cert = fs.readFileSync("../keyscerts/fullchain.pem", "utf8");
var credentials = {
    key: privateKey,
    cert: cert
};
app.set('view engine', 'pug');
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.use(express.static(__dirname + "/views"));
//app.user(express.static(path.join(__dirname, '/')));
app.get("/", function (req, res) {
    res.render('index', res);
});
app.get("*", function (req, res) {
    res.send('404');
});
var server = https.createServer(credentials, app).listen(8000, "0.0.0.0", function () {
    console.log("Listening on", server.address().address, server.address().port);
});
