(function () {
  var tempActive = true;
  var movementActive = true;

  var toggleMovementButton = document.querySelector('#movementButton');
  toggleMovementButton.addEventListener('click', function (event) {
    var paket = {
      active: !movementActive,
      type: 'movement'
    };

    sendStatusPaket(paket);

    movementActive = !movementActive;
    var newText = movementActive ? 'Disable Movement' : 'Enable Movement';

    toggleMovementButton.textContent = newText;
  });

  var toggleTemperatureButton = document.querySelector('#temperatureButton');
  toggleTemperatureButton.addEventListener('click', function (event) {
    var paket = {
      active: !tempActive,
      type: 'temperature'
    };

    sendStatusPaket(paket);

    tempActive = !tempActive;
    var newText = tempActive ? 'Disable Temperature' : 'Enable Temperature';

    toggleTemperatureButton.textContent = newText;
  });

  function sendStatusPaket(paket) {
    console.log('sending paket: ', paket);

    var url = 'http://192.168.0.14:3000/status/' + paket.active + '/' + paket.type;
    var httpRequest = new XMLHttpRequest();

    httpRequest.onreadystatechange = function () {
      if (httpRequest.readyState === XMLHttpRequest.DONE) {
        if (httpRequest.status === 200) {
          console.log('Paket sucessfully sent!');
        } else {
          console.log('Could not successfully send the paket.');
        }
      }
    };

    httpRequest.open('GET', url);
    httpRequest.send();
  }
})();
