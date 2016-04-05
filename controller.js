'use strict'

let async = require('async');
let TemperatureSensor = require('./temperature-sensor');
let MovementSensor = require('./movement-sensor');
let RESTConnector = require('./rest-connector');
let TemperatureData = require('./temperature-data');

class Controller {
  constructor() {
    console.log('setting up Controller');

    this.criticalTemp = 27;
    this.alarmTempDifference = 5;
    this.attachedTempInterval = null;
    this.attachedTempSensors = [];
    this.movementSensor = new MovementSensor(23);
    this.restConnector = new RESTConnector('192.168.0.10', 8000);

    this.attachTemperatureInterval();
    this.attachMovementInterval();
  }

  attachMovementInterval() {
    setInterval(() => {
      this.handleMovement();
    }, 2000);
  }

  attachTemperatureInterval() {
    TemperatureSensor.listSensors().then((sensors) => {
      sensors.forEach((sensorName) => {
        let sensor = new TemperatureSensor(sensorName);
        this.attachedTempSensors.push(sensor);
      });

      var tempInterval = setInterval(() => {
        this.handleTemperature();
      }, 5000);

      this.attachedTempInterval = tempInterval;
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

      let temp = this.attachedTempSensors[0].lastTemperature;
      let temp2 = this.attachedTempSensors[1].lastTemperature;
      let difference = Math.abs(temp - temp2);
      let isCritical = temp > this.criticalTemp && temp2 > this.criticalTemp;

      console.log('Difference: ' + difference);
      let ping = new TemperatureData(temp, temp2, difference, isCritical);
      this.restConnector.sendPing(ping).then(() => {
        if (difference > this.alarmTempDifference) {
          console.log('WE NEED TO SEND AN ALARM!!');
        }
      });
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
