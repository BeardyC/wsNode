"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redis = require("redis");
var crypto = require("crypto");
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
            console.log(err, reply);
            if (reply === null) {
                var hash = crypto.createHash("sha256");
                hash.update(crypto.randomBytes(128));
                _this.db.set(username, _this.generateTimestamp());
                _this.db.set(username + "_salt", hash.digest("hex"));
                callback(new Response(ResponseStatus.SUCCESS, "User created successfuly"));
            }
            else {
                callback(new Response(ResponseStatus.ERROR, "User already exists"));
            }
        });
    };
    return TFA;
}());
exports.default = TFA;
