'use strict'

let http = require('http');

class RESTConnector {
  constructor(baseURL, port) {
    this.baseURL = baseURL;
    this.port = port;
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
    let promise = new Promise((resolve, reject) => {
      this.sendPOST(JSON.stringify(alarm), '/alarm').then(() => {
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
        res.on('end', () => {
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
