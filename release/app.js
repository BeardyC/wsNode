"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../typings/index.d.ts" />
var express = require("express");
var fs = require("fs");
var tfa_1 = require("./tfa");
var https = require("https");
var body = require("body-parser");
var crypto = require("crypto");
var User = require("./models/users");
var WS = require("./models/webService");
var obj;
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
var app = express();
app.use(body.urlencoded({ extended: false }));
app.use(body.json());
var twofactor = new tfa_1.default(15, "sha256", 4);
var privateKey = fs.readFileSync("../keyscerts/server-key.pem", "utf8");
var cert = fs.readFileSync("../keyscerts/server-cert.pem", "utf8");
var credentials = {
    key: privateKey,
    cert: cert
};
app.use(express.static(__dirname + "/views"));
//app.user(express.static(path.join(__dirname, '/')));
/*app.get("/", function (req, res) {
    res.status(200).sendFile(__dirname + "/views/index.html");
});*/
app.post("/encrypt", function (req, res) {
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
});
app.post("/check/", function (req, res) {
    res.json("Welcome");
    console.log("Welcome,", req.body.name);
});
app.post("/checkCode/", function (req, res) {
    twofactor.checkCode(req.body.username, req.body.code, function (response) {
        res.json({ resp: response });
    });
});
app.get("/getUsers", function (req, res) {
    twofactor.getUsers(function (response) {
        res.json({ resp: response });
    });
});
app.get("/createUser/:name:/:fname/:lname/:dob/:email/:password", function (req, res) {
});
app.post("/registerUser", function (req, res) {
    console.log(req.body.username);
    var obj = new User.User(req.body.username, req.body.fname, req.body.lname, req.body.dob, req.body.email, req.body.password);
    console.log(obj);
    twofactor.registerUser(obj, function (response) {
        res.json({ resp: response });
    });
});
app.get("/getAllWS", function (req, res) {
    twofactor.getAllWS(function (response) {
        res.json({ resp: response });
    });
});
app.get("/test", function (req, res) {
    res.json({ resp: "ASDASDSd" });
});
app.post("/registerWebService", function (req, res) {
    var obj = new WS.WebService(req.body.username, null, req.body.password, req.body.email, null, null, null);
    twofactor.registerWS(obj, function (response) {
        res.json({ resp: response });
    });
});
app.post("/verifyPassword", function (req, res) {
    var ws = new WS.WebService(null, null, null, null, null, req.body.apikey, null);
    var user = new User.User(req.body.username, "a", "b", "c", "email", req.body.password, "e", "0");
    twofactor.verifyAPIkey(ws, function (response) {
        if (response.content.valid == true) {
            twofactor.verifyPassword(user, function (response) {
                if (response.equal = true) {
                    res.json({ resp: response });
                }
                else {
                    res.json({ resp: response });
                }
            });
        }
        else {
            /*res.json({res:response,message:"Invalid API Key"})*/
            res.json({ res: "Invalid API Key" });
        }
    });
});
app.post("/getCode", function (req, res) {
    twofactor.generateOtp(req.body.username, function (response) {
        res.json({ resp: response });
    });
});
app.post("/verifyCode", function (req, res) {
    twofactor.checkCode(req.body.username, req.body.code, function (response) {
        res.json({ resp: response });
    });
});
app.post("/generate", function (req, res) {
});
app.post("/verifyAPIKey", function (req, res) {
    var apikey = req.body.apikey;
    var obj = new WS.WebService(null, null, null, null, null, apikey, null);
    twofactor.verifyAPIkey(obj, function (response) {
        res.json({ resp: response });
    });
});
app.get("*", function (req, res) {
    res.send('404');
});
var server = https.createServer(credentials, app).listen(443, "0.0.0.0", function () {
    console.log("Listening on", server.address().address, server.address().port);
});
