'use strict'

class TemperatureData {
  constructor(temp, temp2, difference, critical) {
    this.temp = temp;
    this.temp2 = temp2;
    this.timestamp = new Date();
    this.difference = difference;
    this.critical = critical;
  }
}

module.exports = TemperatureData;
