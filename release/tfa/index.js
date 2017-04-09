"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var redis = require("redis");
var crypto = require("crypto");
var uuid = require("uuid");
var promise = require("bluebird");
var options = {
    promiseLib: promise
};
var pgp = require('pg-promise')(options);
var cn = {
    host: 'localhost',
    port: '5432',
    database: 'otp_users',
    user: 'xyz',
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
    TFA.prototype.getAll = function (callback) {
        db.any('select * from user_table')
            .then(function (data) {
            console.log(data);
            callback(new Response(ResponseStatus.SUCCESS, { output: data }));
        })
            .catch(function (err) {
            callback(new Response(ResponseStatus.ERROR, { data: err }));
        });
    };
    TFA.prototype.createUserPostGres = function (user, callback) {
        var _this = this;
        console.log("Name passed    :   ", user.name);
        console.log("password passed    :   ", user.password);
        db.one('select * from user_table where u_name = ${name}', { name: user.name })
            .then(function (data) {
            console.log("FOUND IT");
            var x = data;
            //callback(new Response(ResponseStatus.SUCCESS, {data: "Found it"}));
            //user.tstamp = this.generateTimestamp();
            //console.log("USER GENERATING TIMESTAMP....   :   ", user.tstamp);
            /* db.none('insert into user_table(u_name, u_salt, u_hashed, u_fname, u_lname, u_dob, u_email, u_timestamp)' +
                 'values (${name},${fname},${lname},${dob},${email},${password},${},)')
                 .then(function () {
                     callback(new Response(ResponseStatus.SUCCESS, { data: 'Inserted record!' }));
                 })
                 .catch(function (err) {
                     callback(new Response(ResponseStatus.ERROR, { data: err }));
                 })*/
            return x;
        })
            .then(function (x) {
            console.log("in here");
            user.tstamp = _this.generateTimestamp();
            console.log(user.tstamp);
            console.log('DATA');
            console.log(x);
            callback(new Response(ResponseStatus.SUCCESS, { data: "Found it and generated!", returned: x }));
        })
            .catch(function (err) {
            console.log("DIDNT FIND IT");
            callback(new Response(ResponseStatus.ERROR, { data: err }));
        });
    };
    TFA.prototype.createUser = function (username, password, callback) {
        var _this = this;
        this.db.get(username, function (err, reply) {
            console.log("Username   :   ", username);
            console.log("Password   :   ", password);
            console.log(err, reply);
            console.log("DONE THIND HERE");
            if (reply === null) {
                var hash = crypto.createHash("sha256");
                hash.update(crypto.randomBytes(128));
                _this.db.set(username, _this.generateTimestamp());
                _this.db.set(username + "_salt", hash.digest("hex"));
                var hashp = crypto.createHash("sha256");
                hashp.update(password);
                _this.db.set(username + "_hashed", hashp.digest("hex"));
                callback(new Response(ResponseStatus.SUCCESS, "User created successfuly"));
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
