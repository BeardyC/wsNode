"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var router = express.Route();
var db = require('../tfa/index');
router.get('/api/users', db.getAllUsers);
router.get('/api/users/:id', db.getSingleUser);
router.post('/api/users', db.createser);
router.put('/api/users/:id', db.updateUser);
router.delete('/api/users/:id', db.removeUser);
router.get('/', function (req, res) {
    res.render();
});
module.exports = router;
