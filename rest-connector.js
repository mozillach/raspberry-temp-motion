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
console.log(postData);
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
console.log('before request......');
      let requestToSend = http.request(options, (res) => {
        res.on('end', () => {
          console.log('No more data in response.');
          resolve();
        });
      });
console.log('before error......');
      requestToSend.on('error', (err) => {
        console.log('problem with request:' + err.message);
        reject();
      });
console.log('before write.....');
      requestToSend.write(postData);
      console.log('after write.......');
      requestToSend.end();
    });

    return promise;
  }
}

module.exports = RESTConnector;
