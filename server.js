var express	= require('express')
var fs 		= require('fs')
var https	= require('https');
var http       = require('http');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
app		= express();
var privateKey  = fs.readFileSync('keyscerts/server-key.pem','utf8')
var cert  = fs.readFileSync('keyscerts/server-cert.pem','utf8')
var credentials = {
	key: privateKey,
	cert: cert
};
app.get('/', function (req, res) {
  res.send('Hello World')
});
app.post('/', function (req, res) {
  res.send('post')
});

https.createServer(credentials,app).listen(443);
