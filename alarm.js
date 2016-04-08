'use strict'

let UUID = require('./uuid');

class Alarm {
  constructor(type, priority, confirmed, data) {
    this.timestamp = new Date();
    this.type = type;
    this.priority = priority;
    this.confirmed = confirmed;
    this.data = data;
    this.id = this.generateId();
  }

  generateId() {
    let uuid = new UUID();

    return uuid.generate();
  }

  confirm() {
    this.confirmed = true;
  }
}

module.exports = Alarm;
