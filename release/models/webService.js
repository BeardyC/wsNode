"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var WebService = (function () {
    function WebService(name, salt, hash, email, timestamp, apikey, apivalidity) {
        if (name === void 0) { name = "name"; }
        if (salt === void 0) { salt = "salt"; }
        if (hash === void 0) { hash = "hash"; }
        if (email === void 0) { email = "email"; }
        if (timestamp === void 0) { timestamp = "timestamp"; }
        if (apikey === void 0) { apikey = "apikey"; }
        if (apivalidity === void 0) { apivalidity = "apivalidity"; }
        this.name = "name";
        this.salt = "salt";
        this.hash = "hash";
        this.email = "email";
        this.timestamp = "timestamp";
        this.apikey = "apikey";
        this.apivalidity = "apivalidity";
        this.name = name;
        this.salt = salt;
        this.hash = hash;
        this.email = email;
        this.timestamp = timestamp;
        this.apikey = apikey;
        this.apivalidity = apivalidity;
    }
    return WebService;
}());
exports.WebService = WebService;
