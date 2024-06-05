// index.js
// where your node app starts

// init project
var express = require('express');
var app = express();

// enable CORS (https://en.wikipedia.org/wiki/Cross-origin_resource_sharing)
// so that your API is remotely testable by FCC 
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));  // some legacy browsers choke on 204

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
  res.sendFile(__dirname + '/views/index.html');
});


// your first API endpoint... 
app.get("/api/hello", function (req, res) {
  res.json({greeting: 'hello API'});
});

//can't resolve the Date.now() problem!
/*const date = new Date("2024 5 23");
const segmentDate = [date.getFullYear(), date.getMonth() + 1, date.getDate()].join('-');
const unixDate = Date.parse(date);*/

app.get('/api/:date?', function(req, res) {
  let date_string = !isNaN(Number(req.params.date)) ? parseInt(req.params.date) : (req.params.date || Date.now());
  const date = new Date(date_string);

  if(isNaN(date)) {
    res.json({
      error: "Invalid Date",
    });
  } else {
    res.json({
      unix: parseInt(date.valueOf()),
      utc: date.toUTCString()
    });
  }
});

// Listen on port set in environment variable or default to 3000
var listener = app.listen(process.env.PORT || 3000, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
