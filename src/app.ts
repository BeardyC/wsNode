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
import * as cors from "cors";

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
app.post("/encrypt", function (req, res) {

    let toBeEncryped: string = req.body.username;
    console.log("Message to Encrypt : ", toBeEncryped);
    let buffer = new Buffer(toBeEncryped);
    let encryped = crypto.publicEncrypt(privateKey, buffer);
    console.log("Encryped message  :   ", encryped)


    let string1 = encryped.toString("base64");
    console.log("Stringified   :   ", string1)

    let buffer2 = new Buffer(string1, "base64");

    let decryped = crypto.privateDecrypt(privateKey, buffer2);
    console.log("Decryped  m    :   ", decryped.toString("utf8"));
    res.send(encryped);
});


app.get("/getUsers", function (req, res) {
    twofactor.getUsers(function (response) {
        res.json(response);
        //console.log(response);
        //console.log(JSON.stringify(response));

        //res.render('index', { test: JSON.stringify(response) });
    })
})




app.post("/registerUser", function (req, res) {
    console.log("test");
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

app.post("/editUser", function (req, res) {

    let user = new User.User(req.body.username,
        req.body.fname,
        req.body.lname,
        req.body.dob,
        req.body.email,
        req.body.password
    );
    console.log(user);

    twofactor.edituser(user, function (response) {
        res.json({ resp: response });
    })
})

app.post("/editWS", function (req, res) {

    let ws = new WS.WebService(req.body.username,
        null,
        null,
        req.body.email,
        null,
        null,
        null);
    twofactor.editWS(ws, function (response) { 
        console.log(response);
        res.json(response)
    })
})

app.post("/userLogin", function (req, res) {
    let user = new User.User(req.body.username,
        null,
        null,
        null,
        null,
        req.body.password,
        null,
        null);
    twofactor.loginUser(user, function (response) {
        console.log(response);
        res.json(response);
    })
})

app.post("/wsLogin", function (req, res) {
    let ws = new WS.WebService(req.body.username,
        null,
        req.body.password);
    twofactor.loginWS(ws, function (response) {
        console.log(response);
        res.json(response);
    })
})

app.post("/mobileLogin", function (req, res) {
    let user = new User.User(req.body.username,
        null,
        null,
        null,
        null,
        req.body.password,
        null,
        null);
    twofactor.loginFromMobile(user, function (response) {
        console.log(response);
        res.json(response);
    })



})

app.post("/deleteUser", function (req, res) {
    let ws = new WS.WebService(null, null, null, null, null, req.body.apikey, null);
    let user = new User.User(req.body.username);

    twofactor.verifyAPIkey(ws, function (response) {
        if (response.content.valid == true) {
            twofactor.deleteUser(user, function (response) {
                console.log(response);
                if (response.status = true) {
                    res.json({ resp: "Successfully deleted user" });
                    console.log()
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


app.get("/getWS", function (req, res) {
    twofactor.getAllWS(function (response) {
        res.json({ resp: response });
    })
})

app.post("/registerWebService", function (req, res) {
    console.log(req.body);
    
    console.log(req.body.username);
    console.log(req.body.email);
    
    
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

app.post("/deleteWebService", function (req, res) {

    let ws = new WS.WebService(req.body.username);
    twofactor.deleteWS(ws, function (response) {
        res.json(response);
    })


})



/*app.post("/verifyPassword", function (req, res) {
    let ws = new WS.WebService(null, null, null, null, null, req.body.apikey, null);
    let user = new User.User(req.body.username,
        "a",
        "b",
        "c",
        "email",
        "password",
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
            
            res.json({ res: "Invalid API Key" })
        }
    })

})*/

app.post("/getCode", function (req, res) {
    let ws = new WS.WebService(null, null, null, null, null, req.body.apikey, null);
    twofactor.verifyAPIkey(ws, function (response) {
        if (response.content.valid == true) {
            twofactor.generateOtp(req.body.username, function (response) {
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

app.post("/verifyCode", function (req, res) {
    let ws = new WS.WebService(null, null, null, null, null, req.body.apikey, null);
    twofactor.verifyAPIkey(ws, function (response) {
        if (response.content.valid == true) {
            twofactor.checkCode(req.body.username, req.body.code, function (response) {
                console.log(response);
                if (response.equal = true) {
                    res.json({ resp: response });
                } else {
                    res.json({ resp: response });
                }
            })
        } else {
            res.json({ res: "Invalid API Key" })
        }
    })
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



