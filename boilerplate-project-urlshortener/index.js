require('dotenv').config();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const { type } = require('express/lib/response');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Basic MongoDB Configuration
const mongoURI = process.env.MONGO_URI;
async function main() {
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
}
main().catch(err => console.log(err));

// Schema + Model
const urlSchema = new mongoose.Schema({
  original_url: { type: String },
  short_url: { type: Number }
});

const URL = mongoose.model('URL', urlSchema);
let incrementer = 1;

// Mongoose ORM fn
const findUrlByShort = (shortUrlSent, done) => {
  URL.findOne({ short_url: shortUrlSent }, (err, data) => {
    if(err) return done(err);
    done(null, data);
  });
};

const createAndSaveUrl = async(urlSent, done) => {
  let url = new URL({
    original_url: urlSent,
    short_url: incrementer++
  });
  await url.save((err, data) => {
    if(err) return done(err);
    done(null, data);
  });
};

const regexUrl = /http(|s):\/\/(|www\.).+(\:|\.)\w{2,4}(|\/|(\/.+))$/i;

// Your API endpoint
app.route('/api/shorturl/:short_url?').get(function(req, res, next) {
  const shortUrlString = req.params.short_url;

  findUrlByShort(shortUrlString, (err, data) => {
    if(err) return next(err);
    if(!data) {
      console.log("Missing `done()` argument");
      return next({ message: "Missing callback argument" });
    }
    if(regexUrl.test(data.original_url))
      res.redirect(data.original_url );
  });
}).post(function(req, res, next) {
  const urlString = req.body.url;

  if(regexUrl.test(urlString)) {
    createAndSaveUrl(urlString, (err, data) => {
      if(err) return next(err);
      if(!data) {
        console.log("Missing `done()` argument");
        return next({ message: "Missing callback argument" });
      }
      URL.findById(data._id, (err, data) => {
        if(err) return next(err);
        res.json({
          original_url: data.original_url,
          short_url: data.short_url,
        });
      });
    });
  } else {
    res.json({ error: "invalid url" });
  }
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});