const bodyParser = require('body-parser');
const express = require('express');
const multer = require('multer');
const cors = require('cors');
require('dotenv').config()

const app = express();

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/public', express.static(process.cwd() + '/public'));

const MIMETYPE = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/svg+xml': 'svg',
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'upload/');
  },
  filename: (req, file, callback) => {
    const formatRegex = /\.\w+/gi;
    const name = file.originalname; //.split(' ').join('_').replace(formatRegex, '');
    const extension = MIMETYPE[file.mimetype];
    callback(null, name); //Date.now() + '_' before
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 1000000 } }); //1MB


app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/fileanalyse', upload.single('upfile'),  (req, res, next) => {
  const upfileData = req.file;

  res.json({
    name: upfileData.filename,
    type: upfileData.mimetype,
    size: upfileData.size
  });
});


const port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log('Your app is listening on port ' + port)
});