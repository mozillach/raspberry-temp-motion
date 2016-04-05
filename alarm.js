'use strict'

class Alarm {
  constructor(type, priority, confirmed, data) {
    this.type = type;
    this.priority = priority;
    this.confirmed = confirmed;
    this.data = data;
  }
}

module.exports = Alarm;
