var map;

function initMap() {
  // Constructor creates a new map - only center and zoom are required.
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.4027209, lng: -122.1811805},
    zoom: 11.5
  });
}
