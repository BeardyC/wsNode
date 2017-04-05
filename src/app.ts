/// <reference path="../typings/index.d.ts" />
import * as express from "express";
import * as  fs from "fs";
import { default as TFA } from './tfa';
import * as https from "https";
import * as http from "http";
import * as body from "body-parser";
import * as crypto from "crypto";


process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
let app = express();
app.use(body.urlencoded({ extended: false }));
app.use(body.json());

let twofactor = new TFA(15, "sha256", 4);
let privateKey = fs.readFileSync("../keyscerts/server-key.pem", "utf8")
let cert = fs.readFileSync("../keyscerts/server-cert.pem", "utf8")
let credentials = {
    key: privateKey,
    cert: cert
};
app.get("/", function (req, res) {
    res.end("Working as intended!");
});
app.post("/", function (req, res) {
    console.log(req.body.name);
    //res.send(req.body.name);
    let toBeEncryped: string = req.body.name;
    console.log("Message to Encrypt : ", toBeEncryped);
    let buffer = new Buffer(toBeEncryped);
    let encryped = crypto.publicEncrypt(privateKey, buffer);
    console.log("encryped  :   ", encryped)


    let string1 = encryped.toString("base64");
    console.log("Stringified   :   ", string1)

    let buffer2 = new Buffer(string1, "base64");

    let decryped = crypto.privateDecrypt(privateKey, buffer2);
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

app.post("/check/", function (req, res) {
    res.json("Welcome");
    console.log("Welcome,", req.body.name);
});
app.get("/createUser/", function (req, res) {
    twofactor.createUser("xy","x", function (response) {
        res.json({req: req.params, resp: response});
    });
});

let server = https.createServer(credentials, app).listen(443, "0.0.0.0", function () {
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
