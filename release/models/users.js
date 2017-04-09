"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var User = (function () {
    function User(name, fname, lname, dob, email, password, tstamp) {
        if (name === void 0) { name = 'name'; }
        if (fname === void 0) { fname = 'fname'; }
        if (lname === void 0) { lname = 'lname'; }
        if (dob === void 0) { dob = 'dob'; }
        if (email === void 0) { email = 'email'; }
        if (password === void 0) { password = 'password'; }
        if (tstamp === void 0) { tstamp = 0; }
        this.name = 'name';
        this.fname = 'fname';
        this.lname = 'lname';
        this.dob = 'dob';
        this.email = 'email';
        this.password = 'password';
        this.tstamp = 0;
        this.name = name;
        this.fname = fname;
        this.lname = lname;
        this.dob = dob;
        this.email = email;
        this.password = password;
        this.tstamp = tstamp;
    }
    return User;
}());
exports.User = User;
