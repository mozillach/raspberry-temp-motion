'use strict'

let async = require('async');
let TemperatureSensor = require('./temperature-sensor');
let MovementSensor = require('./movement-sensor');

class Controller {
  constructor() {
    console.log('setting up Controller');

    this.attachedTempSensors = [];
    this.movementSensor = new MovementSensor(23);

    this.attachTemperatureInterval();
    this.attachMovementInterval();
  }

  attachMovementInterval() {
    setInterval(() => {
      this.handleMovement();
    }, 2000);
  }

  attachTemperatureInterval() {
    let attachedIntervals = [];

    TemperatureSensor.listSensors().then((sensors) => {
      sensors.forEach((sensorName) => {
        let sensor = new TemperatureSensor(sensorName);
        this.attachedTempSensors.push(sensor);

        setInterval(() => {
          this.handleTemperature();
        }, 5000);
      })
    });
  }

  handleTemperature() {
    async.each(this.attachedTempSensors, (sensor, callback) => {
      sensor.getTemperature().then((temp) => {
        sensor.lastTemperature = temp;
        callback();
      });
    }, (err) => {
      if (err) {
        console.log(err);
      }

      let difference = Math.abs(this.attachedTempSensors[0].lastTemperature - this.attachedTempSensors[1].lastTemperature);

      // TODO: fix me, since we're doing this twice
      // TODO: in which period should we send out alarms?
      console.log('Difference: ' + difference);

      if (difference > 5) {
        console.log('WE NEED TO SEND OUT AN ALARM!!!');
      }
    });
  }

  handleMovement() {
    this.movementSensor.detectMovement().then((movement) => {
      console.log('Movement: ' + movement);

      // TODO: fix me, since we don't want to send out an alarm every time
      if (movement == 1) {
        console.log('we have movement!!');
      } else {
        console.log('we dont have movement');
      }
    });
  }
}


module.exports = Controller;
