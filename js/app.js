/*-----MODEL-----*/

var locations = [
  {title: 'Apple', location: {lat:37.331676, lng: -122.030189}},
  {title: 'AMD', location: {lat:37.385777, lng: -121.998558}},
  {title: 'Lockheed Martin', location: {lat:37.415918, lng: -122.035878}},
  {title: 'Hewlett Packard', location: {lat:37.412339, lng: -122.14796}},
  {title: 'Electronic Arts', location: {lat:37.523279, lng: -122.254144}},
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

var map;

var bounds;

var polygon;

var markers = [];

var defaultIcon;

var highlightedIcon;

var mainInfoWindow;

var drawingManager;

function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.4400972, lng: -121.8339223},
    zoom: 11.2,
    mapTypeControl: false
  });

  function makeMarkerIcon(markerColor) {
    var markerImage = new google.maps.MarkerImage(
      'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
      '|80|_|%E2%80%A2',
      new google.maps.Size(31, 54),
      new google.maps.Point(0, 0),
      new google.maps.Point(10, 34),
      new google.maps.Size(31,54));
    return markerImage;
  }

  locations = locations;

  defaultIcon = makeMarkerIcon('FF4B40');

  highlightedIcon = makeMarkerIcon('86DFF9');

  mainInfoWindow = new google.maps.InfoWindow();

  drawingManager = new google.maps.drawing.DrawingManager({
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    drawingControl: true,
    drawingControlOptions: {
      position: google.maps.ControlPosition.TOP_RIGHT,
      drawingModes: [
        google.maps.drawing.OverlayType.POLYGON
      ]
    }
  });
}

var Company = function(data) {
  this.name = ko.observable(data.title);
  this.location = ko.observable(data.location);
}


/*-----VIEWMODEL-----*/
var ViewModel = function() {

  var self = this;

  this.companyList = ko.observableArray([]);

  this.companyName = ko.observable();

  this.chosenCompany = ko.observable();

  this.wikiLinks = ko.observableArray([]);

  this.nytLinks = ko.observableArray([]);

  this.chosenWiki = ko.observable();

  this.chosenNYT = ko.observable();

  this.wikiAlert = ko.observable();

  this.nytAlert = ko.observable();

  this.drawingModeText = ko.observable('Drawing Mode Off');

  locations.forEach(function(companyInfo) {
    self.companyList.push(new Company(companyInfo));
  });

  this.populateMarkers = function() {
    self.companyName('Silicon Valley');
    self.getAJAX();
    bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
      var position = locations[i].location;
      var title = locations[i].title;

      var marker = new google.maps.Marker({
        position: position,
        title: title,
        animation: null,
        icon: defaultIcon,
        id: i
      });

      markers.push(marker);
      marker.addListener('click', function() {
        self.companyName(this.title);
        self.getAJAX();
        for (var i = 0; i < markers.length; i++) {
          markers[i].setAnimation(null);
        }
        this.setAnimation(google.maps.Animation.BOUNCE);
        self.populateInfoWindow(this, mainInfoWindow);
      });
      marker.addListener('mouseover', function() {
        this.setIcon(highlightedIcon);
      });
      marker.addListener('mouseout', function() {
        this.setIcon(defaultIcon);
      });
    }
    for (var i = 0; i < markers.length; i++) {
      markers[i].setAnimation(google.maps.Animation.DROP)
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  this.showCompanies = function() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setAnimation(google.maps.Animation.DROP)
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  this.hideCompanies = function() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
      markers[i].setAnimation(google.maps.Animation.DROP);
    }
  }

  this.showSingleCompany = function() {
    self.companyName(self.chosenCompany().name());
    this.hideCompanies();
    self.getAJAX();
    var mainInfoWindow = new google.maps.InfoWindow();
    for (var i = 0; i < markers.length; i++) {
      if (self.companyName() == markers[i].title) {
        markers[i].setAnimation(google.maps.Animation.BOUNCE);
        markers[i].setMap(map);
        map.panTo(markers[i].position);
        map.setZoom(13);
        self.populateInfoWindow(markers[i], mainInfoWindow);
        document.getElementById('company-list').addEventListener('select', function() {
          mainInfoWindow.close();
        });
        document.getElementById('show-companies').addEventListener('click', function() {
          mainInfoWindow.close();
        });
      }
    }
  }

  this.populateInfoWindow = function(marker, mainInfoWindow) {
    if (mainInfoWindow.marker != marker) {
      mainInfoWindow.setContent('');
      mainInfoWindow.marker = marker;
      mainInfoWindow.addListener('closeclick', function() {
        mainInfoWindow.marker = null;
        marker.setAnimation(null);
      });
      var streetViewService = new google.maps.StreetViewService();
      var radius = 125;

      this.getStreetView = function(data, status) {
        if (status === google.maps.StreetViewStatus.OK) {
          var nearStreetViewLocation = data.location.latLng;
          var heading = google.maps.geometry.spherical.computeHeading(
            nearStreetViewLocation, marker.position);
            mainInfoWindow.setContent('<div><strong>' + marker.title + '</div></strong>' +
              '<hr>' + '<div id="pano"></div>' + '<hr>');
            var panoramaOptions = {
              position: nearStreetViewLocation,
              pov: {
                heading: heading,
                pitch: 20
              }
            };
          var panorama = new google.maps.StreetViewPanorama(
            document.getElementById('pano'), panoramaOptions);
        } else {
          mainInfoWindow.setContent('<div><strong>' + marker.title + '</div></strong>' +
            '<hr>' + '<div>No Streetview found</div>' + '<hr>');
        }
      }
      streetViewService.getPanoramaByLocation(marker.position, radius, this.getStreetView);
      mainInfoWindow.open(map, marker);
    }
  }

  this.toggleDrawingTools = function() {
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    if (drawingManager.map) {
      document.getElementById('drawing-tools').setAttribute('class', 'btn');
      self.drawingModeText('Drawing Mode Off');
      drawingManager.setMap(null);
      if (polygon) {
        polygon.setMap(null);
      }
    } else {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
        markers[i].setAnimation(google.maps.Animation.DROP);
      }
      drawingManager.setMap(map);
      drawingManager.addListener('overlaycomplete', function(event) {
        drawingManager.setDrawingMode(null);
        polygon = event.overlay;
        polygon.setEditable(true);
        self.polygonSearch();
        polygon.getPath().addListener('set_at', self.polygonSearch);
        polygon.getPath().addListener('insert_at', self.polygonSearch);
      });
      document.getElementById('drawing-tools').setAttribute('class', 'btn-drawing-mode-on');
      self.drawingModeText('Drawing Mode On');
    }
  }

  this.polygonSearch = function() {
    for (var i = 0; i < markers.length; i++) {
      if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
        markers[i].setMap(map);
      } else {
        markers[i].setMap(null);
      }
    }
  }

  this.getAJAX = function() {
    self.wikiLinks([]);
    self.nytLinks([]);
    self.wikiAlert(null);
    var wikiRequestTimeout = setTimeout(function() {
      self.wikiAlert(' for ' + self.companyName() + ' could not be loaded at this time');
    }, 5000);
    var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search='
    + self.companyName() + '&format=json&callback=wikiCallback';
    $.ajax({
      url: wikiURL,
      dataType: "jsonp",
      success: function(response) {
        var wikiResults = response[1];
        for (var i = 0; i < wikiResults.length; i++)  {
          var title = wikiResults[i];
          var url = 'http://en.wikipedia.org/wiki/' + title.replace(/ /g, "_");
          self.wikiLinks.push({title: title, url: url});
          clearTimeout(wikiRequestTimeout);
        }
      }
    });
    var nytURL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q='
        + self.companyName().replace(/ /g, "%") + '&sort=newest&api-key=544f5bc5e26648598845064157acd780';
    $.getJSON(nytURL, function (data) {
      var nytResults = data.response.docs;
      for (var i = 0; i < nytResults.length; i++) {
        var article = nytResults[i];
        var headline = article.headline.main;
        var headlineURL = article.web_url;
        var snippet = article.snippet;
        self.nytLinks.push({headline: headline, url: headlineURL, snippet: snippet});
      };
    }).fail(function(e){
        self.nytAlert(' For ' + self.companyName() + ' Could Not Be Loaded At This Time');
    });
  }

this.followWikiLink = function() {
  if (typeof self.chosenWiki() != 'undefined') {
    window.open(self.chosenWiki().url);
  }
}

this.followNYTLink = function() {
  if (typeof self.chosenNYT() != 'undefined') {
    window.open(self.chosenNYT().url);
  }
}

  if (typeof google === 'object' && typeof google.maps === 'object') {
    self.showCompanies();
  } else {
    setTimeout(self.populateMarkers, 1000);
  }
}

ko.applyBindings(new ViewModel());
