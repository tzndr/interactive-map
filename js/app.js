//This file provides functionaliy to the interactive map.
//Completed 9/27/2018.

//Declaring global variables
var map;

var bounds;

var polygon;

var markers = [];

var defaultIcon;

var highlightedIcon;

var mainInfoWindow;

var drawingManager;

var Company = function(data) {
  this.name = data.title;
  this.location = data.location;
  this.address = data.address;
  this.category = data.category;
  this.logo = data.logo;
};

// Error handling for Google Maps initialzation.
function googleMapsFail() {
  alert('Google Maps could not be loaded at this time.');
}

//Initializing the map and core map variables.
function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: 37.4400972, lng: -121.8339223},
    zoom: 11.2,
    mapTypeControl: false
  });
  //Creation of markers and their color, size, etc.
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
  //Creation of infowindow instance
  mainInfoWindow = new google.maps.InfoWindow();
  //Creation of the drawing manager used when toggleDrawingTools is called.
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


  var ViewModel = function() {
    var self = this;
    //Creation of observables used for bindings in HTML file to update the view.
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

    this.showHideMainPanel = ko.observable(true);

    this.showHideInfoPanel = ko.observable(true);

    this.showHidePanelText = ko.observable('Hide Panels');

    this.chosenCategory = ko.observable(false);

    this.panelSelection = ko.observable();

    this.panelCompanyList = ko.observableArray([]);

    this.zoomButtonStatus = ko.observable(false);

    this.zoomButtonText = ko.observable('Zoom');

    this.companyLogo = ko.observable();

    this.categories = ko.observableArray([
      'All',
      'Computers',
      'Military',
      'Games',
      'IT',
      'Internet',
      'Entertainment',
      'Transportation',
      'Science',
      'Payments'
    ]);
    //Pushes all company data to observableArray for use in the view.
    locations.forEach(function(companyInfo) {
      self.companyList.push(new Company(companyInfo));
      self.panelCompanyList.push(new Company(companyInfo));
    });
    //Initial loading and populating of all markers as well as making the inital
    //request for asychronous information on the map's default location.
    this.populateMarkers = function() {
      self.companyName('Silicon Valley');
      self.companyAddress('California, USA');
      self.companyLogo('img/company_logos/silicon_valley.png');
      self.sendAJAX();
      bounds = new google.maps.LatLngBounds();
      for (var i = 0; i < locations.length; i++) {
        var position = locations[i].location;
        var title = locations[i].title;
        var address = locations[i].address;
        var logo = locations[i].logo;
        //Creating the marker.
        var marker = new google.maps.Marker({
          position: position,
          title: title,
          address: address,
          logo: logo,
          animation: null,
          icon: defaultIcon,
          id: i
        });
        //Pushing all markers to the markers list and adding listeners.
        markers.push(marker);
        marker.addListener('click', function() {
          self.companyLogo(this.logo);
          self.companyName(this.title);
          self.companyAddress(this.address);
          self.sendAJAX();
          self.zoomButtonStatus(true);
          if (self.showHidePanelText() != 'Show Panels') {
            self.showHideInfoPanel(true);
          }
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
      for (var j = 0; j < markers.length; j++) {
        markers[j].setAnimation(google.maps.Animation.DROP);
        markers[j].setMap(map);
        bounds.extend(markers[j].position);
      }
      map.fitBounds(bounds);
    };
    //Shows all markers on the map and pans out the map view as well as requesting
    //asynchronous information about the map's location.
    this.showCompanies = function() {
      self.companyName('Silicon Valley');
      self.companyAddress('California, USA');
      self.companyLogo('img/company_logos/silicon_valley.png');
      self.sendAJAX();
      self.zoomButtonStatus(false);
      if (self.showHidePanelText() === 'Show Panels') {
        self.showHideInfoPanel(false);
      } else {
        self.showHideInfoPanel(true);
      }
      for (var i = 0; i < markers.length; i++) {
        markers[i].setAnimation(google.maps.Animation.DROP);
        markers[i].setMap(map);
        bounds.extend(markers[i].position);
      }
      map.fitBounds(bounds);
    };
    //Hides all map markers.
    this.hideCompanies = function() {
      for (var i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
        markers[i].setAnimation(google.maps.Animation.DROP);
      }
    };
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
    };
    //Shows selected company, zooms, opens infowindow, and updates asynchronous
    //company information.
    this.showSingleCompany = function() {
      for (var i = 0; i < markers.length; i++) {
        if (self.companyName() === markers[i].title) {
          markers[i].setAnimation(google.maps.Animation.BOUNCE);
          if (self.zoomButtonText() === 'Zoom') {
            map.panTo(markers[i].position);
            map.setZoom(17);
          } else {
            map.setZoom(11.2);
            map.fitBounds(bounds);
          }
          self.populateInfoWindow(markers[i], mainInfoWindow);
          if (self.zoomButtonText() === 'Zoom') {
            self.zoomButtonText('Pan Out');
          } else {
            self.zoomButtonText('Zoom');
          }
        }
      }
    };
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
                '<hr>' + '<div id="pano" class="panorama"></div>' + '<hr>');
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
        };
        streetViewService.getPanoramaByLocation(marker.position, radius, this.getStreetView);
        mainInfoWindow.open(map, marker);
      }
    };

    //Sets the status of polygon drawing search mode to on or off and hides/shows
    //markers accordingly as well as changes CSS style of drawing mode button.
    this.toggleDrawingTools = function() {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      if (drawingManager.map) {
        document.getElementById('drawing-tools').setAttribute('class', 'drawing-btn');
        self.drawingModeText('Drawing Mode Off');
        self.showHideInfoPanel(true);
        self.showHideMainPanel(true);
        self.showHidePanelText('Hide Panels');
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
        self.showHideInfoPanel(false);
        self.showHideMainPanel(false);
        self.showHidePanelText('Show Panels');
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
    };
    //Displays markers within drawn polygon when drawing tools are used.
    this.polygonSearch = function() {
      for (var i = 0; i < markers.length; i++) {
        if (google.maps.geometry.poly.containsLocation(markers[i].position, polygon)) {
          markers[i].setMap(map);
        } else {
          markers[i].setMap(null);
        }
      }
    };

    //AJAX/JSON requests getting unique results for each selected business asychronously.
    this.sendAJAX = function() {
      self.wikiLinks([]);
      self.nytLinks([]);
      //Shows error message if the request in unsuccessful.
      var wikiRequestTimeout = setTimeout(function() {
        alert('Wikipedia links for ' + self.companyName() + ' could not be loaded at this time');
      }, 5000);
      var wikiURL = 'http://en.wikipedia.org/w/api.php?action=opensearch&search=' +
      self.companyName() + '&format=json&callback=wikiCallback';
      //AJAX call for Wikipedia links relating to selected company.
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
      var nytURL = 'https://api.nytimes.com/svc/search/v2/articlesearch.json?q=' +
          self.companyName().replace(/ /g, "%") +
          '&sort=newest&api-key=544f5bc5e26648598845064157acd780';
      //JSON call for NYT articles relating to selected company.
      $.getJSON(nytURL, function (data) {
        var nytResults = data.response.docs;
        for (var i = 0; i < nytResults.length; i++) {
          var article = nytResults[i];
          var headline = article.headline.main;
          var headlineURL = article.web_url;
          var snippet = article.snippet;
          self.nytLinks.push({headline: headline, url: headlineURL, snippet: snippet});
        }
      //Shows error message if the request in unsuccessful.
      }).fail(function(e){
          alert('NY Times articles for ' + self.companyName() +
            ' could not be loaded at this time');
      });
    };
    //Function that opens link in new tab when Wikipedia link selected from dropdown.
    this.followWikiLink = function() {
      if (typeof self.chosenWiki() != 'undefined') {
        window.open(self.chosenWiki().url);
      }
    };
    //Function that opens link in new tab when NYT article selected from dropdown.
    this.followNYTLink = function() {
      if (typeof self.chosenNYT() != 'undefined') {
        window.open(self.chosenNYT().url);
      }
    };
    //Shows or hides both the info panel and main panel
    this.togglePanel = function() {
      if (self.showHidePanelText() === 'Hide Panels') {
        self.showHideMainPanel(false);
        self.showHideInfoPanel(false);
        self.showHidePanelText('Show Panels');
      } else {
        self.showHideMainPanel(true);
        self.showHideInfoPanel(true);
        self.showHidePanelText('Hide Panels');
      }
    };
    //Function that filters panel list results depending on selected category.
    this.categorySearch = function() {
      self.panelCompanyList([]);
      for (var i = 0; i < self.companyList().length; i++) {
        var company = self.companyList()[i];
        if (company.category === self.chosenCategory()) {
          self.panelCompanyList.push(company);
          for (var x = 0; x < markers.length; x++) {
            var marker = markers[x];
            marker.setMap(null);
            marker.setAnimation(google.maps.Animation.DROP);
            for (var j = 0; j < self.panelCompanyList().length; j++) {
              var filteredCompanies = self.panelCompanyList()[j];
              if (filteredCompanies.name === markers[x].title) {
                marker.setMap(map);
              }
            }
          }
        } else if (self.chosenCategory() === 'All') {
          self.panelCompanyList.push(company);
          for (var z = 0; z < markers.length; z++) {
            markers[z].setAnimation(google.maps.Animation.DROP);
            markers[z].setMap(map);
          }
        }
      }
    };
    //Function that opens infowindow, makes AJAX calls, bounces marker, and
    //updates information panel of the company selected from main panel.
    this.panelCompanySelection = function(selectedCompany) {
      for (var i = 0; i < self.panelCompanyList().length; i++) {
        var clickedCompany = self.panelCompanyList()[i];
        if (selectedCompany.name === clickedCompany.name) {
          self.companyName(clickedCompany.name);
          self.companyLogo(clickedCompany.logo);
          self.companyAddress(clickedCompany.address);
          self.sendAJAX();
          self.zoomButtonStatus(true);
          if (self.showHidePanelText() != 'Show Panels') {
            self.showHideInfoPanel(true);
          }
        }
      }
      for (var j = 0; j < markers.length; j++) {
        markers[j].setAnimation(null);
        if (self.companyName() === markers[j].title) {
          markers[j].setAnimation(google.maps.Animation.BOUNCE);
          self.populateInfoWindow(markers[j], mainInfoWindow);
        }
      }
    };
    this.populateMarkers();
  };
  ko.applyBindings(new ViewModel());
}
