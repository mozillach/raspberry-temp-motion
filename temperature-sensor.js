'use strict'

var fs = require('fs');
var glob = require('glob');

class TemperatureSensor {
  constructor(name) {
    this.name = name;
    this.lastTemperature = 0;
  }

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

  getTemperature(cb) {
    var sensorInfoPath = '/sys/bus/w1/devices/' + this.name + '/w1_slave';
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

module.exports = TemperatureSensor;
