/// <reference path="../typings/index.d.ts" />
import * as express from "express";
import * as  fs from "fs";
import { default as TFA } from './tfa';
import * as https from "https";
import * as http from "http";
import * as body from "body-parser";
import * as crypto from "crypto";
import * as path from "path";
import * as User from "./models/users";

let obj: User.User;






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

app.use(express.static(__dirname + "/views"));
//app.user(express.static(path.join(__dirname, '/')));
app.get("/", function (req, res) {
    res.status(200).sendFile(__dirname + "l/views/index.html");
});
app.post("/encrypt", function (req, res) {
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
});

/*app.get("/create/:user", function (req, res) {
    twofactor.createUser(req.params.user, function (response) {
        res.json({ req: req.params, resp: response });
    });
});*/
app.post("/registerWebService/", function (req, res) {
    console.log("Registering Webservice");
    console.log(req.body.wname);
    console.log(req.body.wpass)
    twofactor.createWebservice(req.body.wname, req.body.wpassword, function (response) {
        res.json(response);
    })

});
app.post("/getApiKey/", function (req, res) {
    console.log("Retrieving Api key");
    console.log(req.body.wname);
    twofactor.getApiKey(req.body.wname, function (response) {
        res.json(response);
    });
})

app.post("/check/", function (req, res) {
    res.json("Welcome");
    console.log("Welcome,", req.body.name);
});
app.post("/createUser/", function (req, res) {
    twofactor.createUser(req.body.username, req.body.password, function (response) {
        res.json({ resp: response });
    });
});

app.post("/checkUser/", function (req, res) {
    console.log("DOING THIS??????????????????????????????");
    twofactor.checkUser(req.body.username, req.body.password, function (response) {
        res.json({ resp: response });
    });
});

app.post("/checkCode/", function (req, res) {
    twofactor.checkCode(req.body.username, req.body.code, function (response) {
        res.json({ resp: response });

    });
});

app.get("/getAll", function (req, res, next) {
    twofactor.getAll(function (response) {
        res.json({ resp: response });
    })
})
app.post("/getAll", function (req, res, next) {

    console.log(req.body.username);
    let obj = new User.User(req.body.username,
                                        "a",
                                        "b",
                                        "c",
                                        "email",
                                        req.body.password,
                                        "e",
                                        "0");

    console.log(obj);

    twofactor.createUserPostGres(obj, function (response) {
        res.json({ resp: response });
    })
})

app.post("/getSpec", function(req,res){
        let obj = new User.User(req.body.username,
                                        "a",
                                        "b",
                                        "c",
                                        "email",
                                        req.body.password,
                                        "e",
                                        "0");
    twofactor.verifyPassword(obj, function(response){
        res.json({resp: response});
    })
})
app.get("*", function (req, res) {
    res.send('404');
});




/*let server = https.createServer(credentials, app).listen(443, function () {
    console.log("Listening on", server.address().address, server.address().port);
});*/
//asdasdasd
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
