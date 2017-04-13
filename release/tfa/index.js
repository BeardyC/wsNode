"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redis = require("redis");
var crypto = require("crypto");
var uuid = require("uuid");
var promise = require("bluebird");
var User = require("../models/users");
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var cn = {
    host: 'localhost',
    port: '5432',
    database: 'otp_users',
    user: 'postgres',
    password: 'admin'
};
//var connString = 'postgres://localhost:5432/otp_users';
var db = pgp(cn);
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus[ResponseStatus["SUCCESS"] = 0] = "SUCCESS";
    ResponseStatus[ResponseStatus["ERROR"] = 1] = "ERROR";
})(ResponseStatus = exports.ResponseStatus || (exports.ResponseStatus = {}));
;
var Response = (function () {
    function Response(status, content) {
        this.status = status;
        this.content = content;
    }
    return Response;
}());
exports.Response = Response;
;
var TFA = (function () {
    function TFA(hashValidity, hashAlgo, hashLength) {
        this.db = redis.createClient();
        this.db.on("error", function (err) {
            console.log("REDIS ERROR:", err);
        });
        this.hashValidity = hashValidity;
        this.hashAlgo = hashAlgo;
        this.hashLength = hashLength;
    }
    TFA.prototype.generateTimestamp = function () {
        return Math.floor(new Date().getTime() / 1000);
    };
    TFA.prototype.getUsers = function (callback) {
        var _this = this;
        db.any('select * from user_table')
            .then(function (data) {
            console.log(data);
            return data;
        })
            .then(function (data) {
            var x = _this.hashpassword("password", "user.salt", 1000);
            callback(new Response(ResponseStatus.SUCCESS, { output: data, key: x }));
        })
            .catch(function (err) {
            callback(new Response(ResponseStatus.ERROR, { data: err }));
        });
    };
    TFA.prototype.getAllWS = function (callback) {
        db.any('SELECT * FROM ws_table')
            .then(function (data) {
            console.log(data);
            callback(new Response(ResponseStatus.SUCCESS, { data: data }));
        })
            .catch(function (err) {
            callback(new Response(ResponseStatus.ERROR, { data: err }));
        });
    };
    TFA.prototype.verifyPassword = function (user, callback) {
        console.log(user);
        var x = this;
        db.one("SELECT * FROM user_table WHERE u_name = ${name}", user)
            .then(function (data) {
            var serverHash = x.hashpassword(user.password, data.u_salt, 1000);
            console.log(data);
            console.log("HASHED FROM DATABASE:  ", data.p_hash);
            //let y = x.hashpassword(user.password,data.u_salt,1000);
            //console.log("HASHED FROM SERVER:    ", y);
            if (serverHash == data.p_hash) {
                callback(new Response(ResponseStatus.SUCCESS, { data: data, equal: true }));
            }
            else {
                callback(new Response(ResponseStatus.SUCCESS, { data: data, equal: false }));
            }
        })
            .catch(function (err) {
            callback(new Response(ResponseStatus.ERROR, { err: err, equal: false }));
        });
    };
    TFA.prototype.verifyAPIkey = function (ws, callback) {
        db.one("SELECT * FROM ws_table WHERE ws_apikey = ${apikey}", ws)
            .then(function (data) {
            var wsname = data.ws_name;
            var today = new Date();
            var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date + ' ' + time;
            var message = "API request made by " + wsname + " at " + dateTime;
            callback(new Response(ResponseStatus.SUCCESS, { data: data, message: message, valid: true }));
        }).catch(function (err) {
            callback(new Response(ResponseStatus.ERROR, { err: err, valid: false }));
        });
    };
    TFA.prototype.registerWS = function (ws, callback) {
        ws.timestamp = this.generateTimestamp().toString();
        ws.salt = crypto.createHash("sha256").update(crypto.randomBytes(128)).digest("hex");
        ws.password = this.hashpassword(ws.password, ws.salt, 1000);
        ws.apikey = uuid.v4();
        console.log(ws);
        db.none("SELECT ws_name FROM ws_table WHERE ws_name = ${name}", ws)
            .then(function () {
            db.none("INSERT INTO ws_table(ws_name, ws_salt, ws_hash, ws_email, ws_timestamp, ws_apikey, ws_apiValidity)" +
                "VALUES(${name}, ${salt}, ${password}, ${email}, ${timestamp}, ${apikey}, ${apivalidity})", ws)
                .then(function () {
                console.log("INSERTED   :   ", ws);
                callback(new Response(ResponseStatus.SUCCESS, { data: 'Successfully registered webservice' }));
            });
        })
            .catch(function (err) {
            callback(new Response(ResponseStatus.ERROR, { data: err }));
        });
    };
    TFA.prototype.registerUser = function (user, callback) {
        user.tstamp = this.generateTimestamp().toString();
        console.log(user.tstamp);
        user.salt = crypto.createHash("sha256").update(crypto.randomBytes(128)).digest("hex");
        user.secret = crypto.createHash("sha256").update(crypto.randomBytes(128)).digest("hex");
        user.password = this.hashpassword(user.password, user.salt, 1000);
        /*//just check username for name, replace with line udner to check for email
        db.none("SELECT u_name, u_email FROM user_table WHERE u_name = ${name} OR u_email = ${email}", user)*/
        db.none("SELECT u_name FROM user_table WHERE u_name = ${name}", user)
            .then(function () {
            console.log(user);
            db.none("INSERT INTO user_table(u_name, u_salt, u_secret, p_hash, u_fname, u_lname, u_dob, u_email, u_timestamp)" +
                "VALUES(${name}, ${salt}, ${secret}, ${password}, ${fname}, ${lname}, ${dob}, ${email}, ${tstamp})", user)
                .then(function () {
                //console.log(data);
                console.log('Inserted   :   ', user);
                callback(new Response(ResponseStatus.SUCCESS, { data: 'Inserted  user' }));
            }).catch(function (err) {
                callback(new Response(ResponseStatus.ERROR, { data: 'ERROR INSERTING', err: err }));
            });
        }).catch(function (err) {
            console.log("User already exists");
            callback(new Response(ResponseStatus.ERROR, { data: 'User already exists', err: err }));
        });
    };
    TFA.prototype.checkCode = function (username, code, callback) {
        var _this = this;
        db.one("SELECT u_salt,u_timestamp FROM user_table WHERE u_name = ${name}", { name: username })
            .then(function (data) {
            var it = _this.generateTimestamp() - Number(data.u_timestamp);
            callback(new Response(ResponseStatus.SUCCESS, { data: data }));
        })
            .catch(function (err) {
            callback(new Response(ResponseStatus.ERROR, { data: err }));
        });
    };
    TFA.prototype.generateOtp = function (username, callback) {
        console.log(username);
        var _this = this;
        var user = new User.User(username, null, null, null, null, null, null, null, null);
        console.log(user);
        db.one("SELECT u_timestamp,u_salt, u_secret FROM user_table WHERE u_name = ${name}", { name: username })
            .then(function (data) {
            var it = (_this.generateTimestamp() - Number(data.u_timestamp)) / _this.hashValidity;
            var x = crypto.pbkdf2Sync(data.u_secret, data.u_salt, it, 20, _this.hashAlgo).toString('hex').substring(0, _this.hashLength + 1);
            callback(new Response(ResponseStatus.SUCCESS, { data: x }));
        })
            .catch(function (err) {
            callback(new Response(ResponseStatus.ERROR, { data: err }));
        });
    };
    TFA.prototype.hashpassword = function (password, salt, it) {
        return crypto.pbkdf2Sync(password, salt, it, 20, this.hashAlgo).toString('hex');
    };
    TFA.prototype.calculateOTP = function (password, salt, it) {
        return crypto.pbkdf2Sync(password, salt, it, 20, this.hashAlgo).toString('hex');
    };
    TFA.prototype.generate = function (username, callback) {
        var _this = this;
        this.db.get(username, function (err, reply) {
            if (reply === null) {
                callback(new Response(ResponseStatus.SUCCESS, "Username doesn't exist"));
            }
            else {
                var epoch_1 = parseInt(reply);
                _this.db.get(username + "_salt", function (err, reply) {
                    if (reply === null) {
                        callback(new Response(ResponseStatus.SUCCESS, "Fatal error"));
                    }
                    else {
                        var hash = crypto.createHash(_this.hashAlgo);
                        var salt = reply;
                        var iteration = Math.floor((_this.generateTimestamp() - epoch_1) / _this.hashValidity);
                        hash.update(salt + iteration);
                        var authCode = hash.digest("hex").substr(0, _this.hashLength);
                        callback(new Response(ResponseStatus.SUCCESS, { code: authCode, it: iteration }));
                    }
                });
            }
        });
    };
    return TFA;
}());
exports.default = TFA;
