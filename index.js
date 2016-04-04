'use strict'

var express = require('express');
var cors = require('cors');
var TemperatureSensor = require('./temperature-sensor.js');
var MovementSensor = require('./movement-sensor.js');
var Controller = require('./controller.js');

var app = express();

app.use(cors());

app.get('/', function (req, res) {
  TemperatureSensor.listSensors(function (sensors) {
    res.send(sensors);
  });
});

app.get('/movement', function (req, res) {
  var movementSensor = new MovementSensor(23);
  movementSensor.detectMovement(function (movementDetected) {
    res.send(movementDetected);
  });
});

app.get('/:id/', function (req, res) {
  var name = req.params.id;
  var tempSensor = new TemperatureSensor(name);

  tempSensor.getTemperature(function (temperature) {
    var response = {
      date: new Date(),
      temp: temperature
    };

    res.send(response);
  });
});

app.listen(3000, function () {
  console.log('API listening on port 3000!');
});

// Init Controller
var controller = new Controller();
