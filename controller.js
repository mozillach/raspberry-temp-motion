'use strict'

let async = require('async');
let TemperatureSensor = require('./temperature-sensor');
let MovementSensor = require('./movement-sensor');
let RESTConnector = require('./rest-connector');
let TemperatureData = require('./temperature-data');
let Alarm = require('./alarm');

class Controller {
  constructor() {
    console.log('setting up Controller');

    this.criticalTemp = 27;
    this.alarmTempDifference = 5;
    this.attachedTempInterval = null;
    this.attachedTempSensors = [];
    this.attachedMovementInterval = null;
    this.movementSensor = new MovementSensor(23);
    this.restConnector = new RESTConnector('192.168.0.10', 8000);

    this.attachTemperatureInterval();
    this.attachMovementInterval();
  }

  attachMovementInterval() {
    let movementInterval = setInterval(() => {
      this.handleMovement();
    }, 2000);

    this.attachedMovementInterval = movementInterval;
  }

  attachTemperatureInterval() {
    TemperatureSensor.listSensors().then((sensors) => {
      console.log(sensors);
      sensors.forEach((sensorName) => {
        let sensor = new TemperatureSensor(sensorName);
        this.attachedTempSensors.push(sensor);
      });

      // Analyze the temperature every 3 minutes (= 3*60*1000 = 180000)
      var tempInterval = setInterval(() => {
        this.handleTemperature();
      }, 180000);

      this.attachedTempInterval = tempInterval;
    });
  }

  handleTemperature() {
    async.each(this.attachedTempSensors, (sensor, callback) => {
      sensor.getTemperature().then((temp) => {
        sensor.lastTemperature = temp;
        callback();
      }).catch((err) => {
        callback(err);
      });
    }, (err) => {
      if (err) {
        console.log('Temperature not working!!!!');
        let alarm = new Alarm('temp_not_working', 2, false, {});
        return this.restConnector.sendAlarm(alarm);
      }

      let temp = this.attachedTempSensors[0].lastTemperature;
      let temp2 = this.attachedTempSensors[1].lastTemperature;
      let difference = Math.abs(temp - temp2);
      let isCritical = temp > this.criticalTemp && temp2 > this.criticalTemp;

      console.log('Difference: ' + difference);
      let ping = new TemperatureData(temp, temp2, difference, isCritical);
      this.restConnector.sendPing(ping).then(() => {
        console.log('Ping saved!');
        if (difference > this.alarmTempDifference) {
          console.log('The difference was higher than expected!');
          let alarm = new Alarm('difference', 0, false, ping);
          return this.restConnector.sendAlarm(alarm);
        }

        return new Promise((resolve, reject) => { resolve() });
      })
      .then(() => {
        if (isCritical) {
          console.log('It is critical!!');
          let alarm = new Alarm('high', 1, false, ping);
          return this.restConnector.sendAlarm(alarm);
        }
      })
      .then(() => {
        console.log('All necessary alarms were sent or there is nothing to do..');
      });
    });
  }

  handleMovement() {
    this.movementSensor.detectMovement().then((movement) => {
      console.log('Movement: ' + movement);

      // TODO: fix me, since we don't want to send out an alarm every time
      if (movement == 1) {
        console.log('we have movement!!');
        let alarm = new Alarm('movement', 1, false, {});
        return this.restConnector.sendAlarm(alarm);
      } else {
        console.log('we dont have movement');
      }
    }).then(() => {
      console.log('All necessary alarms sent.');
    }).catch((err) => {
      console.log('Movement not working!!!!');
      let alarm = new Alarm('movement_not_working', 1, false, {});
      return this.restConnector.sendAlarm(alarm);
    });
  }

  toggleMovementMeasurement(active) {
    if (active === 'true') {
      this.attachMovementInterval();
    } else if (active === 'false') {
      this.detachMovementInterval();
    }
  }

  toggleTemperatureMeasurement(active) {
    if (active === 'true') {
      this.attachTemperatureInterval();
    } else if (active === 'false') {
      this.detachTemperatureInterval();
    }
  }

  detachTemperatureInterval() {
    console.log('Detaching Temperature Interval');
    clearInterval(this.attachedTempInterval);
    this.attachedTempInterval = 0;
  }

  detachMovementInterval() {
    console.log('Detaching Movement Interval');
    clearInterval(this.attachedMovementInterval);
    this.attachedMovementInterval = 0;
  }
}


module.exports = Controller;
