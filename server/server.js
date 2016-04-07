'use strict'

let express = require('express');
let cors = require('cors');
let bodyParser = require('body-parser');
var path = require('path');
var jade = require('jade');
let MongoClient = require('mongodb').MongoClient;

let pingCollection = null;
let alarmCollection = null;

let url = 'mongodb://localhost:27017/raspberry';
MongoClient.connect(url, (err, db) => {
  console.log("Connected correctly to server");

  pingCollection = db.collection('pings');
  alarmCollection = db.collection('alarms');
});

let app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');

app.get('/', (req, res) => {
  let ping;
  let alarms = [];

  pingCollection.find({}).sort({
    timestamp: -1
  }).limit(1).toArray(function(err, pingItems) {
    ping = pingItems[0];

    alarmCollection.find({}).sort({
      timestamp: -1
    }).limit(10).toArray(function(err, alarmItems) {
      alarms = alarmItems;

      res.render('index', { alarms: alarms, ping: ping });
    });;
  });;
});

app.post('/ping', (req, res) => {
  console.log('API got a Ping!');
  var data = JSON.parse(req.body.data);
  pingCollection.insert(data, (err, result) => {
    if (err) {
      console.log('ERROR: ' + err);
    }

    res.send(result);
  });
});

app.post('/alarm', (req, res) => {
  console.log('API got an Alarm!');
  var data = JSON.parse(req.body.data);
  alarmCollection.insert(data, (err, result) => {
    if (err) {
      console.log('ERROR: ' + err);
    }

    res.send(result);
  });
});

app.listen(8000, () => {
  console.log('API listening on port 8000!');
});
