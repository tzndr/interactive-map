var model = {
  map: null,
  
  locations: [
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
    {title: 'Visa', location: {lat: 37.559252, lng: 122.276365}}
  ]
};

  function initMap() {
    // Constructor creates a new map - only center and zoom are required.
    model.map = new google.maps.Map(document.getElementById('map'), {
      center: {lat: 37.4027209, lng: -122.1811805},
      zoom: 11.5,
      mapTypeControl: false
    });
  }
