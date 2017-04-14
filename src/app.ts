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
import * as WS from "./models/webService";
import * as pug from "pug";

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
app.set('view engine', 'pug')
app.use(express.static(__dirname + "/views"));
//app.user(express.static(path.join(__dirname, '/')));
app.get("/", function (req, res) {
    res.render('index',res);
});
/*app.post("/encrypt", function (req, res) {
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
});*/


app.get("/getUsers", function (req, res) {
    twofactor.getUsers(function (response) {
        //res.json(response)
        console.log(response);
        
        
       // console.log(JSON.stringify(response));
        
        res.render('index',{test: JSON.stringify(response)});
    })
})




app.post("/registerUser", function (req, res) {

    console.log(req.body.username);
    let obj = new User.User(req.body.username,
        req.body.fname,
        req.body.lname,
        req.body.dob,
        req.body.email,
        req.body.password
    );

    console.log(obj);

    twofactor.registerUser(obj, function (response) {
        res.json({ resp: response });
    })
})


app.get("/getWS", function (req, res) {
    twofactor.getAllWS(function (response) {
        res.json({ resp: response });
    })
})

app.post("/registerWebService", function (req, res) {

    let obj = new WS.WebService(req.body.username,
        null,
        req.body.password,
        req.body.email,
        null,
        null,
        null
    );
    twofactor.registerWS(obj, function (response) {
        res.json({ resp: response });
    })

})


app.post("/verifyPassword", function (req, res) {
    let ws = new WS.WebService(null, null, null, null, null, req.body.apikey, null);
    let user = new User.User(req.body.username,
        "a",
        "b",
        "c",
        "email",
        req.body.password,
        "e",
        "0");
    twofactor.verifyAPIkey(ws, function (response) {
        if (response.content.valid == true) {
            twofactor.verifyPassword(user, function (response) {
                if (response.equal = true) {
                    res.json({ resp: response });
                } else {
                    res.json({ resp: response });
                }
            })
        } else {
            /*res.json({res:response,message:"Invalid API Key"})*/
            res.json({ res: "Invalid API Key" })
        }
    })

})

app.post("/getCode", function (req, res) {

    twofactor.generateOtp(req.body.username, function (response) {

        res.json({ resp: response });
    })
})

app.post("/verifyCode", function (req, res) {

    twofactor.checkCode(req.body.username, req.body.code, function (response) {
        res.json({ resp: response });
    })
})

app.post("/generate", function (req, res) {

})

app.post("/verifyAPIKey", function (req, res) {

    let apikey = req.body.apikey;
    let obj = new WS.WebService(null, null, null, null, null, apikey, null);
    twofactor.verifyAPIkey(obj, function (response) {
        res.json({ resp: response });
    })
})


app.get("*", function (req, res) {
    res.send('404');
});



let server = https.createServer(credentials, app).listen(443, "0.0.0.0", function () {
    console.log("Listening on", server.address().address, server.address().port);
});



