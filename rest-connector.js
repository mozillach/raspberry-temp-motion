'use strict'

let http = require('http');

class RESTConnector {
  constructor(baseURL, port) {
    this.baseURL = baseURL;
    this.port = port;
    this.lastSentAlarmTime = 0;
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
    let currentTime = Date.now();
    if (alarm.priority < 2 && currentTime - this.lastSentAlarmTime < 600000) {
      return new Promise((resolve, reject) => { resolve(); });
    }

    let promise = new Promise((resolve, reject) => {
      this.sendPOST(JSON.stringify(alarm), '/alarm').then(() => {
        this.lastSentAlarmTime = Date.now();
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
