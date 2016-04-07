'use strict'

let fs = require('fs');
let glob = require('glob');

class TemperatureSensor {
  constructor(name) {
    this.name = name;
    this.lastTemperature = 0;
  }

  static listSensors() {
    let promise = new Promise((resolve, reject) => {
      glob("/sys/bus/w1/devices/28-*/w1_slave", {}, (er, sensors) => {
        sensors = sensors.map((sensor) => {
          sensor = sensor.replace('/sys/bus/w1/devices/', '');
          sensor = sensor.replace('/w1_slave', '');
          return sensor;
        });

        resolve(sensors);
      });
    });

    return promise;
  }

  getTemperature() {
    let promise = new Promise((resolve, reject) => {
      let sensorInfoPath = '/sys/bus/w1/devices/' + this.name + '/w1_slave';
      fs.readFile(sensorInfoPath, 'utf8', (err, data) => {
        let temp = "";
        let reg = /t\=[0-9]{5}/;
        let match = reg.exec(data);

        if (match && match[0]) {
          temp = match[0].split('=')[1];
          temp = parseInt(temp, 10);
          temp = temp / 1000;

          resolve(temp);
        } else {
          reject(new Error('Could not read sensor ' + this.name));
        }
      });
    });

    return promise;
  }
}

module.exports = TemperatureSensor;
