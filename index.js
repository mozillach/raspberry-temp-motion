'use strict'

var express = require('express');
var fs = require('fs');
var glob = require('glob');
var cors = require('cors');
var gpio = require('rpi-gpio');

var app = express();

app.use(cors());

app.get('/', function (req, res) {
  TemperatureSensorReader.listSensors(function (sensors) {
    res.send(sensors);
  });
});

app.get('/movement', function (req, res) {
  var movementSensor = new MovementSensorReader();
  //movementSensor.init(); <-- make promise based and remove setup from detectMovement
  movementSensor.detectMovement(function (movementDetected) {
    res.send(movementDetected);
  });
});

app.get('/:id/', function (req, res) {
  var tempSensor = new TemperatureSensorReader();
  var name = req.params.id;

  tempSensor.getTemperature(name, function (temperature) {
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

class TemperatureSensorReader {
  static listSensors(cb) {
    glob("/sys/bus/w1/devices/28-*/w1_slave", {}, function (er, sensors) {
      sensors = sensors.map(function (sensor) {
        sensor = sensor.replace('/sys/bus/w1/devices/', '');
        sensor = sensor.replace('/w1_slave', '');
        return sensor;
      });

      cb(sensors);
    });
  }

  getTemperature(name, cb) {
    var sensorInfoPath = '/sys/bus/w1/devices/' + name + '/w1_slave';
    fs.readFile(sensorInfoPath, 'utf8', function (err, data) {
      var temp = "";
      var reg = /t\=[0-9]{5}/;
      var match = reg.exec(data);

      temp = match[0].split('=')[1];
      temp = parseInt(temp, 10);
      temp = temp / 1000;

      cb(temp);
    });
  }
}

class MovementSensorReader {
  getGPIOPin() {
    return 23;
  }

  /*init() {
    gpio.setup(this.getGPIOPin(), gpio.DIR_IN);
  }*/

  detectMovement(cb) {
    gpio.setup(this.getGPIOPin(), gpio.DIR_IN, () => {
      gpio.read(this.getGPIOPin(), (err, value) => {
        console.log('err: ' + err);
        console.log('read value: ' + value);
        cb('The value is ' + value);
      });
    });

  }
}
