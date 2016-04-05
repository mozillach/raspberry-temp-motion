'use strict'

let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
let MongoClient = require('mongodb').MongoClient;

let pingCollection = null;
let alarmCollection = null;

let url = 'mongodb://localhost:27017/raspberry';
MongoClient.connect(url, (err, db) => {
  console.log("Connected correctly to server");

  pingCollection = db.collection('pings');
  alarmCollection = db.collection('alarms');

  db.close();
});

let app = express();

app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.send('Main overview');
});

app.get('/ping', (req, res) => {

});

app.post('/ping', (req, res) => {
  console.log('got..');
  console.log(req.body.data);
  var data = JSON.parse(req.body.data);
  pingCollection.insert(data, (err, result) => {
    if (err) {
      console.log('ERROR: ' + err);
    }

    res.send(result);
  });
});

app.get('/alarm', (req, res) => {
  res.send('used to get alarms');
});

app.post('/alarm', (req, res) => {
  res.send('used to save alarm');
});

app.listen(8000, () => {
  console.log('API listening on port 8000!');
});
