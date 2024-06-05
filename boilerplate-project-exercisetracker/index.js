const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();

// Basic Configuration
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Basic MongoDB Configuration
const mongoURI = process.env.MONGO_URI;
async function main() {
  await mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true });
};
main().catch(err => console.log(err));

// Schema + Model
const userSchema = new mongoose.Schema({
  username: { type: String, require: true },
  log: [{}],
});

const USER = mongoose.model('USER', userSchema);

// Mongoose ORM fn
const createAndSaveUser = async (username, done) => {
  let user = new USER({
    username: username
  });
  await user.save((err, data) => {
    if(err) return done(err);
    done(null, data);
  });
}

const findUser = async (userId, done) => {
  await USER.findById(userId, (err, data) => {
    if(err) return done(err);
    done(null, data);
  });
}

// Endpoints
app.route('/api/users').post((req, res, next) => {
  const usernameString = req.body.username;

  createAndSaveUser(usernameString, (err, data) => {
    if(err) return next(err);
    if(!data) {
      console.log("Missing `done()` argument");
      return next({ message: "Missing callback argument" });
    }
    USER.findById(data._id, (err, data) => {
      if(err) return next(err);
      res.json({
        _id: data._id,
        username: data.username
      });
    });
  });

}).get((req, res, next) => {
  USER.find((err, data) => {
    if(err) return next(err);
    res.json(data.map(o => ({
      _id: o._id,
      username: o.username
    })));
  });
});

app.post('/api/users/:_id/exercises', (req, res, next) => {
  const idString = req.params._id;
  const descriptionString = req.body.description;
  const durationNumber = Number(req.body.duration);
  const dateString = req.body.date;

  const dateCreated = dateString ? new Date(dateString) : new Date();
  const dateParsed = dateCreated.toDateString();

  findUser(idString, (err, data) => {
    if(err) return next(err);
    if(!data) {
      console.log("Missing `done()` argument");
      return next({ message: "Missing callback argument" });
    }
    USER.findByIdAndUpdate(data._id, {
      "$push": { log: {
        description: descriptionString,
        duration: durationNumber,
        date: dateParsed,
      }
      }
    }, { new: true }, (err, data) => {
      if(err) return next(err);
      res.json({
        _id: data._id,
        username: data.username,
        description: descriptionString,
        duration: durationNumber,
        date: dateParsed,
      });
    });
  })
});

app.get('/api/users/:_id/logs', (req, res, next) => {
  const idString = req.params._id;
  const { from: from, to: to, limit: limit } = req.query;

  findUser(idString, (err, data) => {
    if(err) return next(err);
    if(!data) {
      console.log("Missing `done()` argument");
      return next({ message: "Missing callback argument" });
    }
    let filteredLog = data.log.reverse();
    const fromDate = new Date(from) || undefined;
    const toDate = new Date(to) || undefined;
    if(from && to) {
      filteredLog = filteredLog.filter(obj => {
        const objDate = new Date(obj.date);
        return (objDate >= fromDate && objDate <= toDate);
      });
    } else if(from || to) {
      filteredLog = filteredLog.filter(obj => {
        const objDate = new Date(obj.date);
        return (objDate >= fromDate && objDate <= toDate) || (objDate >= fromDate) || (objDate <= toDate);
      });
    }
    if(limit)
      filteredLog = filteredLog.slice(0, limit);
    res.json({
      username: data.username,
      from: from,
      to: to,
      count: data.log.length,
      id_: data._id,
      log: filteredLog
    });
  })
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})

/*
TODO
- /api/users -> [{_id: "...", username: 'paul'}, {...}...]
- /api/users/:_id/exercises -> {_id: "...", username: 'paul', description...}
  - .../logs -> 
*/