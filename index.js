'use strict'

let express = require('express');
let cors = require('cors');
let TemperatureSensor = require('./temperature-sensor');
let MovementSensor = require('./movement-sensor');
let Controller = require('./controller');

let app = express();

app.use(cors());

app.get('/', (req, res) => {
  TemperatureSensor.listSensors().then((sensors) => {
    res.send(sensors);
  });
});

app.get('/movement', (req, res) => {
  let movementSensor = new MovementSensor(23);
  movementSensor.detectMovement().then((movementDetected) => {
    res.send(movementDetected);
  });
});

app.get('/:id/', (req, res) => {
  let name = req.params.id;
  let tempSensor = new TemperatureSensor(name);

  tempSensor.getTemperature().then((temperature) => {
    let response = {
      date: new Date(),
      temp: temperature
    };

    res.send(response);
  });
});

app.listen(3000, () => {
  console.log('API listening on port 3000!');
});

// Init Controller
let controller = new Controller();
