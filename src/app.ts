/// <reference path="../typings/index.d.ts" />
import * as express from "express";
import * as  fs from "fs";
import * as https from "https";
import * as http from "http";
import * as body from "body-parser";
import * as crypto from "crypto";
import * as path from "path";

import * as pug from "pug";
import * as cors from "cors";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let app = express();
app.use(body.urlencoded({ extended: false }));
app.use(body.json());

let privateKey = fs.readFileSync("../keyscerts/privkey.pem", "utf8")
let cert = fs.readFileSync("../keyscerts/fullchain.pem", "utf8")
let credentials = {
    key: privateKey,
    cert: cert
};
app.set('view engine', 'pug')
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


let server = https.createServer(credentials, app).listen(4443, "0.0.0.0", function () {
    console.log("Listening on", server.address().address, server.address().port);
});



