"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redis = require("redis");
var crypto = require("crypto");
var uuid = require("uuid");
//var parse = require('pg-connection-string').parse;
//var config1 = parse('postgres://xyz@localhost:5432/xyz')
//let connectionString = process.env.DATABASE_URL || "postgres://localhost:5432/xyz";
//import * as pg1 from 'pg';
//const pg = require('pg');
/*let config = {
    user:   'xyz',
    database: 'xyz',
    password: '',
    host: 'localhost',
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000
};
const pool = new pg1.Client(config1);*/
//const Client = new pg.Client(connectionString);
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
    TFA.prototype.createUser = function (username, password, callback) {
        var _this = this;
        this.db.get(username, function (err, reply) {
            console.log("Username   :   ", username);
            console.log("Password   :   ", password);
            console.log(err, reply);
            if (reply === null) {
                var hash = crypto.createHash("sha256");
                hash.update(crypto.randomBytes(128));
                _this.db.set(username, _this.generateTimestamp());
                _this.db.set(username + "_salt", hash.digest("hex"));
                var phash_1 = _this.hash1(password, function (err, reply) {
                    console.log("phash  :   ", phash_1);
                    _this.db.set(username + "_hashed", phash_1, function (err, reply) {
                        if (reply === null) {
                            callback(new Response(ResponseStatus.SUCCESS, "Couldn't save"));
                        }
                        else {
                            callback(new Response(ResponseStatus.SUCCESS, "asdf"));
                        }
                    });
                });
                /* this.db.get(username + "_salt", (err, reply) => {
                     console.log("salt : " + reply);
 
                 });*/
                //console.log("NOT HASHED",password + this.db.get(username + "_salt"));
                //console.log("HASHEd",this.hash(password + this.db.get(username + "_salt"),callback));
                //this.db.set(username+"_p_h", this.hash(password+this.db.get(username + "_salt"),callback));
                //let data = password + reply;
                //let hashed = this.hash(data,callback)
                //console.log("DIGESTED   :   ");
                /*                this.hash(data, function (hashed) {
                                    console.log("Hashed     :   ", hashed);
                                    this.db.set(password, hashed);
                                })*/
            }
            else {
                callback(new Response(ResponseStatus.ERROR, "User already exists"));
            }
        });
    };
    TFA.prototype.checkUser = function (username, password, callback) {
        var _this = this;
        this.db.get(username, function (err, reply) {
            console.log(err, reply);
            console.log("Username  :   ", reply);
            _this.db.get(username + "_salt", function (err, reply) {
                console.log("User Salt  :   ", reply);
                _this.db.get(username + "_hashed", function (err, reply) {
                    console.log("User hash  :   ", reply);
                    callback(new Response(ResponseStatus.SUCCESS, "Yay"));
                });
            });
        });
    };
    TFA.prototype.checkCode = function (username, code, callback) {
    };
    TFA.prototype.createWebservice = function (servicename, password, callback) {
        var _this = this;
        this.db.get(servicename, function (err, reply) {
            console.log(err, reply);
            var apikey = uuid.v4();
            console.log(apikey);
            //let hash = crypto.createHash("sha256");
            _this.db.set(servicename, servicename);
            var x = _this.hash(password);
            console.log("x  :   ", x);
            _this.db.set(servicename + "_password", _this.hash(password));
            _this.db.set(servicename + "_apiKey", apikey);
            callback(new Response(ResponseStatus.SUCCESS, "Webservice created successfuly"));
        });
    };
    TFA.prototype.hash1 = function (data, callback) {
        var hash = crypto.createHash('sha256');
        console.log("DATA   :   ", data);
        console.log("Hashing    :   ", hash.update(data));
        callback(hash.digest("hex"));
    };
    TFA.prototype.hash = function (data) {
        var hash = crypto.createHash('sha256');
        console.log("DATA   :   ", data);
        console.log("Hashing    :   ", hash.update(data));
        return (hash.digest("hex").toString());
    };
    TFA.prototype.getApiKey = function (servicename, callback) {
        var _this = this;
        this.db.get(servicename, function (err, reply) {
            if (reply === null) {
                callback(new Response(ResponseStatus.ERROR, "Webservice not registered"));
            }
            else {
                _this.db.get(servicename + "_apiKey", function (err, reply) {
                    if (reply === null) {
                        callback(new Response(ResponseStatus.ERROR, "Key Does not exist"));
                    }
                    else {
                        var apikey = reply;
                        callback(new Response(ResponseStatus.SUCCESS, { servicename: servicename, apiKey: apikey }));
                    }
                });
            }
        });
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
