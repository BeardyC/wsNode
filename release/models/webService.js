"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebService = (function () {
    function WebService(name, salt, password, email, timestamp, apikey, apivalidity) {
        if (name === void 0) { name = "name"; }
        if (salt === void 0) { salt = "salt"; }
        if (password === void 0) { password = "password"; }
        if (email === void 0) { email = "email"; }
        if (timestamp === void 0) { timestamp = "timestamp"; }
        if (apikey === void 0) { apikey = "apikey"; }
        if (apivalidity === void 0) { apivalidity = "apivalidity"; }
        this.name = (name === null) ? 'name' : name;
        this.salt = (salt === null) ? 'salt' : salt;
        this.password = (password === null) ? 'password' : password;
        this.email = (email === null) ? 'email' : email;
        this.timestamp = (timestamp === null) ? 'timestamp' : timestamp;
        this.apikey = (apikey === null) ? 'apikey' : apikey;
        this.apivalidity = (apivalidity === null) ? 'true' : apivalidity;
    }
    return WebService;
}());
exports.WebService = WebService;
