'use strict'

var gpio = require('rpi-gpio');

class MovementSensor {
  constructor(pin) {
    this.pin = pin;
  }

  detectMovement(cb) {
    gpio.setup(this.pin, gpio.DIR_IN, () => {
      gpio.read(this.pin, (err, value) => {
        console.log('err: ' + err);
        console.log('read value: ' + value);
        cb('The value is ' + value);
      });
    });

  }
}

module.exports = MovementSensor;
