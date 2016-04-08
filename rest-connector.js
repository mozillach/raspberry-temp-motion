'use strict'

let http = require('http');
let async = require('async');

class RESTConnector {
  constructor(baseURL, port) {
    this.baseURL = baseURL;
    this.port = port;
    this.lastSentAlarmTime = 0;
    this.sentAlarms = [];
  }

  sendPing(ping) {
    let promise = new Promise((resolve, reject) => {
      this.sendPOST(JSON.stringify(ping), '/ping').then(() => {
        resolve();
      });
    });

    return promise;
  }

  sendAlarm(alarm) {
    // We should only send a new alarm in case the last alarm was more than
    // 10 minutes ago (= 10*60*1000 ms = 600'000 ms)
    // Further, if the priority is higher than 1 (2 and above), we need to send
    // the alarm any time!
    // We need to exclude the temperature alarm in this case, since we want to send
    // an alarm every time the difference is too big.
    let currentTime = Date.now();
    if (alarm.type !== 'difference' && alarm.type !== 'high' && alarm.priority < 2 && currentTime - this.lastSentAlarmTime < 600000) {
      console.log('NOT SENDING ALARM SINCE IT HASNT BEEN 10 MINUTES');
      return new Promise((resolve, reject) => { resolve(); });
    }

    let promise = new Promise((resolve, reject) => {
      this.sendPOST(JSON.stringify(alarm), '/alarm').then(() => {
        this.lastSentAlarmTime = Date.now();
        this.sentAlarms.push(alarm);
        console.log('Alarm ' + alarm.id + ' sent!');
        console.log(this.sentAlarms);
        resolve();
      });
    });

    return promise;
  }

  resendAlarms() {
    console.log('Starting to resend alarms!');

    let unsentAlarms = this.sentAlarms.filter((alarm) => {
      return !alarm.confirmed;
    });

    let promise = new Promise((resolve, reject) => {
      async.each(unsentAlarms, (alarm, callback) => {
        this.sendPOST(JSON.stringify(alarm), '/alarm').then(() => {
          callback();
        });
      }, (err) => {
        if (err) {
          console.log('There was an error resending the alarms.');
        }

        console.log('All alarms resent!');
        resolve();
      });
    });

    return promise;
  }

  sendPOST(paket, endpoint) {
    console.log('Starting to send ping');

    let promise = new Promise((resolve, reject) => {
      let postData = {
        data: paket
      };

      postData = JSON.stringify(postData);

      let options = {
        hostname: this.baseURL,
        port: this.port,
        path: endpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': postData.length
        }
      };

      let requestToSend = http.request(options, (res) => {
        res.on('data', (chunk) => {
          console.log('Received: ' + chunk);
        });

        res.on('end', () => {
          console.log('Ping saved!');
          resolve();
        });
      });

      requestToSend.on('error', (err) => {
        console.log('problem with request:' + err.message);
        reject();
      });

      requestToSend.write(postData);
      requestToSend.end();
    });

    return promise;
  }
}

module.exports = RESTConnector;
