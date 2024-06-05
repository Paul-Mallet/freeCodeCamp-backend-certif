// index.js
// where your node app starts

// init project
require('dotenv').config();
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC
var cors = require('cors');
app.use(cors({ optionsSuccessStatus: 200 })); // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});

// your first API endpoint...
app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

// /api/whoami
app.get('/api/whoami', (req, res) => {
  const ipAddress = req.header("x-forwarded-for") || req.socket.remoteAddress;
  const preferredLanguages = req.header('accept-language') || req.acceptsLanguages().join(',');
  const userAgents = req.header("user-agent");
  res.json({
    ipaddress: ipAddress,
    language: preferredLanguages,
    software: userAgents
  })
});

// listen for requests :)
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

/*
Express.js(AbstractAPI.com / mdn)
1. ip address(client) with req.socket.remoteAddress / req.header("x-forwarded-for")
-> useful to prevent fraud + provide custom UX based on geolocalisation
-> if client = current device = loopback address
-> ::1(ipV6) = 127.0.0.1(ipV4)
-> if req made behind proxy serv, need req.header to get original client address(forwarded chain)
-> 'x-forwarded-for' field in header return N ip addresses from proxy server, 1rst is the original
-> if client req come from proxy, else return undefined and need socket solution
2. language with req.acceptLanguages() / req.header("accept-language") or req.get("...") with express
-> useful to return content in user's prefered language
-> return first accepted language of specified others from 'Accept-Language' field of HTTP header
-> if none accepted, return false
-> if no args() return all languages Array
-> with req.header(...), can see quality value suffix(q=0.9) indicate relative preference
-> q=1 if no qv specified
3. software with req.header("user-agent") or req.get(...)
-> useful to adapt content to client's limits and capacity(version)
-> return Mozilla/5.0(token says Mozilla compatible) (<system-information>) <platform>(browser running on) (<platform-details>) <extensions>
-> gecko = render engine of Mozilla
*/