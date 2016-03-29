
$(function() {
    obtainLocation();
});

var LocationURL = '/api/colours';

// Simple indicator for checking if the browser supports geolocations.
if (navigator.geolocation) {
  console.log('Geolocation is supported!');
}
else {
  console.log('Geolocation is not supported for this Browser/OS version yet.');
}

obtainLocation = function() {
  var startPos;
  var geoSuccess = function(position) {
    startPos = position;
    document.getElementById('latitude').value = startPos.coords.latitude;
    document.getElementById('longitude').value = startPos.coords.longitude;
    console.log(JSON.stringify(startPos.coords, null , 4));
    console.log(startPos.coords.latitude)
    console.log(startPos.coords.longitude)
  };
  navigator.geolocation.getCurrentPosition(geoSuccess);

};


$("#viewLocations" ).click(function() {
  $.ajax({
    url: LocationURL,
    dataType: 'json',
    cache: false,
    success: function(data) {
      //TODO: instead of alerting with the data, display it in a table or something.
      alert(JSON.stringify(data, null, 4));
    }.bind(this),
    error: function(xhr, status, err) {
      console.error(this.url, status, err.toString());
    }.bind(this)
  });
});


$("#postColour" ).click(function() {

  // TODO: This should be updated to hold relevant/useful data.
  var newLocation = {
    id: Date.now(),
    red: 100,
    green: 0,
    blue: 0,
  }

  $.ajax({
    url: LocationURL,
    dataType: 'json',
    type: 'POST',
    data: newLocation,
    success: function(data) {
      alert('done');
    }.bind(this),
    error: function(xhr, status, err) {
      console.error(this.url, status, err.toString());
    }.bind(this)
  });
});
