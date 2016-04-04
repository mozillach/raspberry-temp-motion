'use strict'

var fs = require('fs');

class MovementSensor {
  constructor(pin) {
    this.pin = pin;
  }

  detectMovement(cb) {
    var sensorInfoPath = '/sys/class/gpio/gpio23/value';
    fs.readFile(sensorInfoPath, 'utf8', function (err, data) {
      cb(data);
    });
  }
}

module.exports = MovementSensor;
