var locations = [
  {
    title: 'Apple',
    location: {lat:37.33182, lng: -122.03118},
    address: 'Apple Campus, Cupertino, CA 95014'
  },
  {
    title: 'AMD',
    location: {lat:37.3829254, lng: -121.9703842},
    address: '2485 Augustine Dr, Santa Clara, CA 95054'
  },
  {
    title: 'Lockheed Martin',
    location: {lat:37.415918, lng: -122.0358779},
    address: '1111 Lockheed Martin Way, Sunnyvale, CA 94089'
  },
  {
    title: 'Hewlett Packard',
    location: {lat:37.3820152, lng: -121.9813847},
    address: '3333 Scott Blvd, Santa Clara, CA 95054'
  },
  {
    title: 'Electronic Arts',
    location: {lat:37.5232794, lng: -122.2541438},
    address: '209 Redwood Shores Pkwy, Redwood City, CA 94065'
  },
  {
    title: 'Cisco',
    location: {lat:37.4084383, lng: -121.9539644},
    address: '170 W Tasman Dr, San Jose, CA 95134'
  },
  {
    title: 'Google',
    location: {lat:37.4218419, lng: -122.0840568},
    address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043'
  },
  {
    title: 'Nvidia',
    location: {lat:37.3541, lng: -121.9552},
    address: '2788 San Tomas Expy, Santa Clara, CA 9505'
  },
  {
    title: 'Netflix',
    location: {lat:37.259585, lng: -121.962695},
    address: '100 Winchester Cir, Los Gatos, CA 95032'
  },
  {
    title: 'Facebook',
    location: {lat:37.484377, lng: -122.148304},
    address: '1 Hacker Way, Menlo Park, CA 94025'
  },
  {
    title: 'Oracle',
    location: {lat:37.528581, lng: -122.2646347},
    address: '100 Oracle Pkwy, Redwood City, CA 94065'
  },
  {
    title: 'Tesla',
    location: {lat:37.394838, lng: -122.150389},
    address: '3500 Deer Creek Rd, Palo Alto, CA 94304'
  },
  {
    title: 'Symantec',
    location: {lat: 37.3981961, lng: -122.0544663},
    address: '350 Ellis St, Mountain View, CA 94043'
  },
  {
    title: 'Intel',
    location: {lat: 37.387591, lng: -121.963787},
    address: '2200 Mission College Blvd, Santa Clara, CA 95054'
  },
  {
    title: 'Riverbed Technology',
    location: {lat:37.3977072 , lng: -122.0300751},
    address: '525 Almanor Ave, Sunnyvale, CA 94085'
  },
  {
    title: 'Agilent Technology',
    location: {lat:37.3248859 , lng: -121.998857},
    address: '5301 Stevens Creek Blvd, Santa Clara, CA 95051'
  },
  {
    title: 'Visa',
    location: {lat: 37.4262136, lng: -122.1431343},
    address: '385 Sherman Ave, Palo Alto, CA 94306'
  }
];

var map;

var bounds;

var polygon;

var markers = [];

var defaultIcon;

var highlightedIcon;

var mainInfoWindow;

var drawingManager;

//Initializing the map and core map variables.
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
  this.address = ko.observable(data.address);
}


var ViewModel = function() {

  var self = this;

  this.companyList = ko.observableArray([]);

  this.companyName = ko.observable();

  this.chosenCompany = ko.observable();

  this.companyAddress = ko.observable();

  this.wikiLinks = ko.observableArray([]);

  this.nytLinks = ko.observableArray([]);

  this.chosenWiki = ko.observable();

  this.chosenNYT = ko.observable();

  this.showHideCompaniesText = ko.observable('Hide All Companies');

  this.drawingModeText = ko.observable('Drawing Mode Off');

  locations.forEach(function(companyInfo) {
    self.companyList.push(new Company(companyInfo));
  });

  //Initial loading and populating of all markers as well as making the inital
  //request for asychronous information on the map's default location.
  this.populateMarkers = function() {
    self.companyName('Silicon Valley');
    self.companyAddress('California, USA')
    self.sendAJAX();
    bounds = new google.maps.LatLngBounds();
    for (var i = 0; i < locations.length; i++) {
      var position = locations[i].location;
      var title = locations[i].title;
      var address = locations[i].address;
      //Creating the marker.
      var marker = new google.maps.Marker({
        position: position,
        title: title,
        address: address,
        animation: null,
        icon: defaultIcon,
        id: i
      });
      //Pushing all markers to the markers list and adding listeners.
      markers.push(marker);
      marker.addListener('click', function() {
        self.companyName(this.title);
        self.companyAddress(this.address);
        self.sendAJAX();
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

  //Shows all markers on the map and pans out the map view as well as requesting
  //asynchronous information about the map's location.
  this.showCompanies = function() {
    self.companyName('Silicon Valley');
    self.companyAddress('California, USA');
    self.sendAJAX();
    for (var i = 0; i < markers.length; i++) {
      markers[i].setAnimation(google.maps.Animation.DROP)
      markers[i].setMap(map);
      bounds.extend(markers[i].position);
    }
    map.fitBounds(bounds);
  }

  //Hides all map markers.
  this.hideCompanies = function() {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(null);
      markers[i].setAnimation(google.maps.Animation.DROP);
    }
  }

  //Enables an HTML button to have dual functionality depending on the state
  //of the map.
  this.showHideCompanies = function() {
    if (self.showHideCompaniesText() === 'Show All Companies') {
      self.showCompanies();
      self.showHideCompaniesText('Hide All Companies');
    } else {
      self.hideCompanies();
      self.showHideCompaniesText('Show All Companies');
    }
  }

  //Shows selected company, zooms, opens infowindow, and updates asynchronous
  //company information.
  this.showSingleCompany = function() {
    self.companyName(self.chosenCompany().name());
    self.companyAddress(self.chosenCompany().address());
    this.hideCompanies();
    self.sendAJAX();
    self.showHideCompaniesText('Show All Companies');
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


  //Populates infowindow with company name and streetview.
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
          //Error handling if streetview isn't found.
        } else {
          mainInfoWindow.setContent('<div><strong>' + marker.title + '</div></strong>' +
            '<hr>' + '<div>No Streetview found</div>' + '<hr>');
        }
      }
      streetViewService.getPanoramaByLocation(marker.position, radius, this.getStreetView);
      mainInfoWindow.open(map, marker);
    }
  }

  //Sets the status of polygon drawing search mode to on or off and hides/shows
  //markers accordingly as well as changes CSS style of drawing mode button.
  this.toggleDrawingTools = function() {
    drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
    if (drawingManager.map) {
      document.getElementById('drawing-tools').setAttribute('class', 'drawing-btn');
      self.drawingModeText('Drawing Mode Off');
      drawingManager.setMap(null);
      if (polygon) {
        polygon.setMap(null);
      }
      self.showCompanies();
      self.showHideCompaniesText('Hide All Companies');
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
      self.showHideCompaniesText('Show All Companies');
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

  //AJAX/JSON requests getting unique results for each selected business asychronously.
  this.sendAJAX = function() {
    self.wikiLinks([]);
    //Shows error message if the request in unsuccessful.
    var wikiRequestTimeout = setTimeout(function() {
      alert('Wikipedia links for ' + self.companyName() + ' could not be loaded at this time');
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
          //Clears timed error message if request is successful.
          clearTimeout(wikiRequestTimeout);
        }
      }
    });
    var nytURL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q='
        + self.companyName().replace(/ /g, "%") +
        '&sort=newest&api-key=544f5bc5e26648598845064157acd780';
    $.getJSON(nytURL, function (data) {
      var nytResults = data.response.docs;
      for (var i = 0; i < nytResults.length; i++) {
        var article = nytResults[i];
        var headline = article.headline.main;
        var headlineURL = article.web_url;
        var snippet = article.snippet;
        self.nytLinks.push({headline: headline, url: headlineURL, snippet: snippet});
      };
      //Shows error message if the request in unsuccessful.
    }).fail(function(e){
        alert('NY Times articles for ' + self.companyName() +
          ' could not be loaded at this time');
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

  //Ensures Google Maps API is loaded before calling the populateMarkers function.
  if (typeof google === 'object' && typeof google.maps === 'object') {
    self.populateMarkers();
  } else {
    setTimeout(self.populateMarkers, 1000);
  }
}

ko.applyBindings(new ViewModel());
