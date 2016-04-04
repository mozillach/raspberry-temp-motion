'use strict'

var async = require('async');
var TemperatureSensor = require('./temperature-sensor.js');
var MovementSensor = require('./movement-sensor.js');

class Controller {
  constructor() {
    console.log('setting up Controller');

    this.attachedTempSensors = [];

    this.attachTemperatureInterval();
    this.attachMovementInterval();
  }

  attachMovementInterval() {
    console.log('movement attached');
  }

  attachTemperatureInterval() {
    var attachedIntervals = [];
    var self = this;

    TemperatureSensor.listSensors((sensors) => {
      sensors.forEach((sensorName) => {
        var sensor = new TemperatureSensor(sensorName);
        self.attachedTempSensors.push(sensor);

        setInterval(() => {
          this.handleTemperature();
        }, 5000);
      })
    });
  }

  handleTemperature() {
    async.eachSeries(this.attachedTempSensors, (sensor, callback) => {
      sensor.getTemperature(function (temp) {
        sensor.lastTemperature = temp;
        callback();
      });
    }, (err) => {
      if (err) {
        console.log(err);
      }

      var difference = Math.abs(this.attachedTempSensors[0].lastTemperature - this.attachedTempSensors[1].lastTemperature);

      // TODO: fix me, since we're doing this twice
      // TODO: in which period should we send out alarms?
      console.log('Difference: ' + difference);

      if (difference > 5) {
        console.log('WE NEED TO SEND OUT AN ALARM!!!');
      }
    });
  }
}


module.exports = Controller;
