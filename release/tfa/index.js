"use strict";
exports.__esModule = true;
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
                _this.db.get(username + "_salt", function (err, reply) {
                    console.log("salt : " + reply);
                });
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
                callback(new Response(ResponseStatus.SUCCESS, "User created successfuly"));
            }
            else {
                _this.db.get(username + "_salt", function (err, reply) {
                    console.log("salt : " + reply);
                });
                callback(new Response(ResponseStatus.ERROR, "User already exists"));
            }
        });
    };
    TFA.prototype.createWebservice = function (servicename, password, callback) {
        var _this = this;
        this.db.get(servicename, function (err, reply) {
            console.log(err, reply);
            var apikey = uuid.v4();
            console.log(apikey);
            var hash = crypto.createHash("sha256");
            _this.db.set(servicename, servicename);
            _this.db.set(password);
            /*if (reply === null) {
                this.db.set(servicename, servicename);
                

            }*/
            callback(new Response(ResponseStatus.SUCCESS, "Webservice created successfuly"));
        });
    };
    TFA.prototype.hash = function (data, callback) {
        var hash = crypto.createHash('sha256');
        console.log("DATA   :   ", data);
        console.log("Hashing    :   ", hash.update(data));
        callback(hash.digest("hex"));
    };
    return TFA;
}());
exports["default"] = TFA;
