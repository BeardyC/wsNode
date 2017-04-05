"use strict";
exports.__esModule = true;
/// <reference path="../typings/index.d.ts" />
var express = require("express");
var fs = require("fs");
var tfa_1 = require("./tfa");
var https = require("https");
var body = require("body-parser");
var crypto = require("crypto");
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var app = express();
app.use(body.urlencoded({ extended: false }));
app.use(body.json());
var twofactor = new tfa_1["default"](15, "sha256", 4);
var privateKey = fs.readFileSync("../keyscerts/server-key.pem", "utf8");
var cert = fs.readFileSync("../keyscerts/server-cert.pem", "utf8");
var credentials = {
    key: privateKey,
    cert: cert
};
app.get("/", function (req, res) {
    res.end("Working as intended!");
});
app.post("/", function (req, res) {
    console.log(req.body.name);
    //res.send(req.body.name);
    var toBeEncryped = req.body.name;
    console.log("Message to Encrypt : ", toBeEncryped);
    var buffer = new Buffer(toBeEncryped);
    var encryped = crypto.publicEncrypt(privateKey, buffer);
    console.log("encryped  :   ", encryped);
    var string1 = encryped.toString("base64");
    console.log("Stringified   :   ", string1);
    var buffer2 = new Buffer(string1, "base64");
    var decryped = crypto.privateDecrypt(privateKey, buffer2);
    console.log("decryped  :   ", decryped.toString("utf8"));
    res.send(encryped);
    /*
      console.log(req.body);
      res.send("Welcome ", req.body.name);*/
    // res.send(req.body.name);
});
/*app.get("/create/:user", function (req, res) {
    twofactor.createUser(req.params.user, function (response) {
        res.json({ req: req.params, resp: response });
    });
});*/
app.post("/registerWebService/", function (req, res) {
    console.log("Registering Webservice");
    console.log(req.body.wname);
    twofactor.createWebservice(req.body.wname, req.body.wpassword, function (response) {
        res.json(response);
    });
});
app.post("/check/", function (req, res) {
    res.json("Welcome");
    console.log("Welcome,", req.body.name);
});
app.post("/createUser/", function (req, res) {
    twofactor.createUser(req.body.username, req.body.password, function (response) {
        res.json({ req: req.params, resp: response });
    });
});
/*let server = https.createServer(credentials, app).listen(443, function () {
    console.log("Listening on", server.address().address, server.address().port);
});*/
//asdasdasd
var server = https.createServer(credentials, app).listen(443, "0.0.0.0", function () {
    console.log("Listening on", server.address().address, server.address().port);
});
/*app.get("/check/:user/:code", function (req, res) {
    twofactor.check(req.params.user, req.params.code, (response) => {
        res.json(response);
    });
});*/
/*let server = app.listen(7777, function () {
    console.log("Listening on", server.address().address, server.address().port);
});*/
