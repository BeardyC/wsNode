import * as express from 'express';
let router = express.Route();
var db = require('../tfa/index');

router.get('/api/users', db.getAllUsers);
router.get('/api/users/:id', db.getSingleUser);
router.post('/api/users', db.createser);
router.put('/api/users/:id', db.updateUser);
router.delete('/api/users/:id', db.removeUser);

router.get('/', function(req,res){
    res.render()
})


module.exports = router;

