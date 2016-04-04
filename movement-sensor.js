'use strict'

let fs = require('fs');

class MovementSensor {
  constructor(pin) {
    this.pin = pin;
  }

  detectMovement() {
    let promise = new Promise((resolve, reject) => {
      let sensorInfoPath = '/sys/class/gpio/gpio23/value';
      fs.readFile(sensorInfoPath, 'utf8', (err, data) => {
        resolve(data);
      });
    });

    return promise;
  }
}

module.exports = MovementSensor;
