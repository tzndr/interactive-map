var map = null;

var markers = [];

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.485034, lng: -121.964375},
    zoom: 11.2,
    mapTypeControl: false
  });

  locations = [
    {title: 'Apple', location: {lat:37.331676, lng: -122.030189}},
    {title: 'AMD', location: {lat:37.385777, lng: -121.998558}},
    {title: 'Lockheed Martin', location: {lat:37.415918, lng: -122.035878}},
    {title: 'HP (Hewlett Packard)', location: {lat:37.412339, lng: -122.14796}},
    {title: 'EA (Electronic Arts)', location: {lat:37.523279, lng: -122.254144}},
    {title: 'Cisco', location: {lat:37.408177, lng: -121.928128}},
    {title: 'Google', location: {lat:37.422, lng: -122.084057}},
    {title: 'Nvidia', location: {lat:37.370535, lng: -121.966749}},
    {title: 'Netflix', location: {lat:37.257103, lng: -121.964178}},
    {title: 'Facebook', location: {lat:37.485071, lng: -122.147424}},
    {title: 'Oracle', location: {lat:37.532098, lng: -122.263174}},
    {title: 'Tesla', location: {lat:37.394706, lng: -122.150325}},
    {title: 'Symantec', location: {lat: 37.398196, lng: -122.054466}},
    {title: 'Intel', location: {lat: 37.387591, lng: -121.963787}},
    {title: 'Riverbed Technology', location: {lat:37.397707 , lng: -122.030075}},
    {title: 'Agilent Technologies', location: {lat:37.324886 , lng: -121.998857}},
    {title: 'Visa', location: {lat: 37.559252, lng: -122.276365}}
  ];

  var defaultIcon = makeMarkerIcon('BB0202');

  var highlightedIcon = makeMarkerIcon('796F65');

  for (var i =0; i < locations.length; i++) {
    var position = locations[i].location;
    var title = locations[i].title;

    var marker = new google.maps.Marker({
      position: position,
      title: title,
      animation: google.maps.Animation.DROP,
      icon: defaultIcon,
      id: i
    });
    markers.push(marker);
  }

  document.getElementById('show-companies').addEventListener('click', function() {
    showCompanies()
  });
}

function makeMarkerIcon(markerColor) {
  var markerImage = new google.maps.MarkerImage(
    'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
    '|40|_|%E2%80%A2',
    new google.maps.Size(21, 34),
    new google.maps.Point(0, 0),
    new google.maps.Point(10, 34),
    new google.maps.Size(21,34));
  return markerImage;
}

function showCompanies() {
  var bounds = new google.maps.LatLngBounds();
  // Extend the boundaries of the map for each marker and display the marker
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
    bounds.extend(markers[i].position);
  }
  map.fitBounds(bounds);
}
