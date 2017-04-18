"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = (function () {
    function User(name, fname, lname, dob, email, password, salt, tstamp, secret) {
        if (name === void 0) { name = 'name'; }
        if (fname === void 0) { fname = 'fname'; }
        if (lname === void 0) { lname = 'lname'; }
        if (dob === void 0) { dob = 'dob'; }
        if (email === void 0) { email = 'email'; }
        if (password === void 0) { password = 'password'; }
        if (salt === void 0) { salt = 'salt'; }
        if (tstamp === void 0) { tstamp = '0'; }
        if (secret === void 0) { secret = 'secret'; }
        this.name = 'name';
        this.fname = 'fname';
        this.lname = 'lname';
        this.dob = 'dob';
        this.email = 'email';
        this.password = 'password';
        this.tstamp = '0';
        this.salt = 'salt';
        this.secret = 'secret';
        this.name = (name === null) ? 'name' : name;
        this.fname = (fname === null) ? 'fname' : fname;
        this.lname = (lname === null) ? 'lname' : lname;
        this.dob = (dob === null) ? 'dob' : dob;
        this.email = (email === null) ? 'email' : email;
        this.password = (password === null) ? 'password' : password;
        this.salt = (salt === null) ? 'salt' : salt;
        this.tstamp = (tstamp === null) ? '1492085120' : tstamp;
        this.secret = (secret === null) ? 'secret' : name;
    }
    return User;
}());
exports.User = User;
