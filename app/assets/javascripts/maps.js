// initialize places address components
var addressForm = {
    street_number: "short_name",
    route: "long_name",
    locality: "long_name",
    administrative_area_level_1: "short_name",
    country: "long_name",
    postal_code: "short_name"
};

// initialize infowindow width
var BOX_WIDTH = 300;

var SV_THUMBNAIL = BOX_WIDTH - 10;

// initialize marker size
var MARKER_HEIGHT = 30, MARKER_WIDTH = 30;

// initialize marker detail information
var markerDetails = [];

// initialize markers array of jSon
var markers = [];

var infowindow = null;

$(document).on('ready page:load', function() {

    // initialize user's current location detected by geolocator
    var selfGeoLocation = new google.maps.LatLng();

    // initialize map, marker, bound, and infowindow
    var map = new google.maps.Map(document.getElementById("map-canvas"));
    var marker = new google.maps.Marker();
    var bounds = new google.maps.LatLngBounds();
    var infowindow = new google.maps.InfoWindow({maxWidth:400});    

    // initialize directionsservice and directionsrenderer
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();

    // initialize panoramio view
    var panoramioLayer = new google.maps.panoramio.PanoramioLayer()    
     
    // Create the autocomplete object, restricting the search
    // to geographical location types.
    // initialize searchbox autocomplete
    var autocomplete = new google.maps.places.Autocomplete(
            document.getElementById("marker_location"), {types: []});

    jQuery(function() {
        markerDetails = maps;
    });

// Start: find user's location 
    var crd, error, options, success;

    if (navigator.geolocation) {
        
        success = function(pos) {
            crd = pos.coords;
            selfGeoLocation = new google.maps.LatLng(crd.latitude, crd.longitude);
            buildMap(selfGeoLocation, 14)
        };
      
        error = function(err) {
// detect user's location by ip address, not accurate data, estimated 500-900 yards
// away from the correct address
            selfGeoLocation = new google.maps.LatLng(GetLatitude, GetLongitude);
            buildMap(selfGeoLocation, 14)
        };
      
        options = {
            enableHighAccuracy: true,
            timeout: 3000,
            maximumAge: 0
        };
      
        navigator.geolocation.getCurrentPosition(success, error, options);
    } 
    else {
        alert("Location search plugin is down!");
    }

// End: find user's location

// Start: Location Searchbox Autocomplete
// When the user selects an address from the dropdown,
// populate the address fields in the hidden form.
    google.maps.event.addListener(autocomplete, "place_changed", function() {
        
        var addressComponent, addressType, val;

// Get the place details from the autocomplete object.          
        var place = autocomplete.getPlace();
        
// Retrieve Places Details reponse address_component array item        
        for (addressComponent in addressForm) {
            document.getElementById(addressComponent).value = "";
            document.getElementById(addressComponent).disabled = false;
        }
        
// Get each component of the address from the place details
// and fill the corresponding field on the form        
        for (var i=0; i<place.address_components.length; i++) {
            addressType = place.address_components[i].types[0];
            if (addressForm[addressType]) {
                val = place.address_components[i][addressForm[addressType]];
                document.getElementById(addressType).value = val;
            }
        }
        
// Retrieve Place Details response formatted_address, formatted_phone_number
// url, website, rating items
        document.getElementById("map_latitude").value = place.geometry.location.lat();
        document.getElementById("map_longitude").value = place.geometry.location.lng();
        document.getElementById("map_name").value = place.name;
        document.getElementById("map_formatted_address").value = place.formatted_address;
        document.getElementById("map_formatted_phone_number").value = place.formatted_phone_number;
        document.getElementById("map_url").value = place.url;
        document.getElementById("map_website").value = place.website;
        document.getElementById("map_rating").value = place.rating;
        document.getElementById("map_map_ref").value = place.reference;
        document.getElementById("map_photos_url").value = place.photos[0].getUrl({
            'maxWidth': 50,
            'maxHeight': 50
        });
    });
// End: Location Searchbox Autocomplete

// Start: Create Panoramio View
    // $('#panoramioView').on("click", function() {
    //     panoramioLayer.setMap(map);
    //     var photoPanel = document.getElementById("photo-panel");
    //     map.controls[google.maps.ControlPosition.RIGHT_TOP].push(photoPanel);
    // });

// End: Create Panoramio View

// Start: Set Panoramio View InfoWindow
    // google.maps.event.addListener(panoramioLayer, "click", function(photo) {

    //     var li = document.createElement("li");
    //     var link = document.createElement("a");

    //     link.innerHTML = photo.featureDetails.title + ": " + photo.featureDetails.author;
    //     link.setAttribute("href", photo.featureDetails.url);
    //     li.appendChild(link);
    //     photoPanel.appendChild(li);
    //     photoPanel.style.display = "block";
    // });
// End: Set Panoramo View InfoWindow

// Start: Build map
    var buildMap;
    buildMap = function(GeoLoc, zoomVal) {
        map.setCenter(new google.maps.LatLng(GeoLoc.lat(), GeoLoc.lng()));
        map.setZoom(zoomVal);
        map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
        
        setMarkers(map, markerDetails);
        
        $(document).on("change", "#mode", function() {
            calcRoute(map);
        });
    };
// End: Build map

// Start: Add markers onto map
    var setMarkers;
    setMarkers = function (map, markerDetails) {
        var geolocation = new google.maps.LatLng();
        var markerIcon, markerLetter, markerCluster;

// add marker of user's location onto map
        var selfIcon = "http://maps.google.com/mapfiles/kml/pushpin/pink-pushpin.png";
        addMarker(map, selfGeoLocation, "My Location", selfIcon, false);

// add all markers onto map        
        for (var i=0; i<markerDetails.length; i++) {
            geolocation = new google.maps.LatLng(markerDetails[i].latitude, markerDetails[i].longitude);
            markerLetter = String.fromCharCode("A".charCodeAt(0) + i);
            markerIcon = "http://maps.google.com/mapfiles/kml/paddle/" + markerLetter + ".png";
            bounds.extend(geolocation);
            addMarker(map, geolocation, markerDetails[i].name, markerIcon, false);
        }
        map.fitBounds(bounds);
        markerCluster = new MarkerClusterer(map, markers);
    };


// Start: Add a marker onto Map
    var addMarker;
    addMarker = function(map, GeoLoc, title, iconUrl, isDraggable) {
        var marker = new google.maps.Marker({
            position: GeoLoc,
            map: map,
            title: title,
            draggable: isDraggable,
            animation: google.maps.Animation.DROP,
            icon: {
                url: iconUrl,
                size: new google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT),
                scaledSize: new google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT)
            }
        });

        
        var str = setupInfoWinContent(marker, BOX_WIDTH);
        attachInfoWindow(str, marker);
        
        if (marker.getPosition() !== selfGeoLocation) {
            markers.push(marker);
        }

    };
// End: Add a marker onto map
        
// Start: Remove a marker from map
    var removeMarker;
    removeMarker = function(marker) {
        marker.setMap(null);
    };
// End: Remove a marker from map

// Start: Draw route and direction, and display direction in a modal
    var calcRoute;
    calcRoute = function(map) {
        directionsDisplay.setMap(map);
        
        var start = new google.maps.LatLng(selfGeoLocation.lat(), selfGeoLocation.lng());
        var end = new google.maps.LatLng(markerDetails[0].latitude, markerDetails[0].longitude);
        var selectedMode = document.getElementById("mode").value;
        
        var request = {
            origin: start,
            destination: end,
            travelMode: google.maps.TravelMode[selectedMode]
        };

        directionsService.route(request, function(response, status) {
            if (status === google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            }
        });

        $("#mapModal").modal("show");
        directionsDisplay.setPanel(document.getElementById("mapModalBody"));
        
        $("#mapModal").on("shown", function() {
            google.maps.event.trigger(map, "resize");
        });
    };
// End: Draw driving route and direction, and display direction in a modal

// Start: Popup Infowindow
    var attachInfoWindow;
    attachInfoWindow = function(contentStr, marker) {
        var infowindow = new google.maps.InfoWindow({
            content: contentStr,
            maxWidth: 400
        });
        
        google.maps.event.addListener(marker, "click", function() {
            infowindow.open(map, marker);

            $(document).on("click", ".gm-sv", function() {
                infowindow.close();
                infowindow = new google.maps.InfoWindow({maxWidth:400});
                setStreetView(map, marker);
            })            
        });
    };
// End: Popup Infowindow        

// Start: Set InfoWindow Content
    var setupInfoWinContent;
    setupInfoWinContent = function(marker, BOX_WIDTH) {
        var address, name, rating, url;
        var box_width = BOX_WIDTH;
        var str = '';
        
        for (var i=0; i<markerDetails.length; i++) {
            if (marker.getPosition().lat() === markerDetails[i].latitude && 
                marker.getPosition().lng() === markerDetails[i].longitude) {
                name = markerDetails[i].name;
                address = markerDetails[i].formatted_address;
                
                if (markerDetails[i].formatted_phone_number.toString() === 
                    "undefined") {
                    markerDetails[i].formatted_phone_number = "";
                }
          
                rating = markerDetails[i].rating;
                url = markerDetails[i].url;
        
                if (markerDetails[i].website.toString() === "undefined") {
                    markerDetails[i].website = "";
                }
        
                if (markerDetails[i].photos_url.toString() === "undefined") {
                    markerDetails[i].photos_url = "";
                }
        
                str = '<div class="infoboxStyle" style="width:' + box_width + 'px;">' +
                            '<div>' +
                                '<span class="gm-title">&nbsp;&nbsp;' + name + '&nbsp;&nbsp;&nbsp;</span>' +
                                '<span class="gm-more"><a href="' + url + '" target="_blank">more info</a></span>' +
                            '</div>' +
                            '<div class="gm-rev">' +
                                '<span class="gm-rating">' + rating + '</span>' +
                                '<span>' +
                                    '<div class="gm-stars-b">' +
                                        '<div class="gm-stars-f" style="width:' + (65 * rating / 5) + 'px;"></div>' +
                                    '</div>' +
                                '</span>' +
                            '</div>' +
                            '<div class="gm-basicinfo">' +
                                '<div class="gm-addr">' + address + '</div>' +
                                '<div class="gm-website"><a href="' + markerDetails[i].website + '" target="_blank">' + decodeURI(markerDetails[i].website) + '</a></div>' +
                                '<div class="gm-phone">' + markerDetails[i].formatted_phone_number + '</div>' +
                            '</div>' +
                            '<div>' +
                            '<a href="#" class="gm-sv thumbnail"><img src="http://maps.googleapis.com/maps/api/streetview?size=' + 
                                SV_THUMBNAIL + 'x50&location=' +
                                markerDetails[i].latitude + ',' + markerDetails[i].longitude + '&heading=270&pitch=0&sensor=true"' +
                                ' id="svThumbnail" /></a>' +
                            '</div>' +
                        '</div>';
            }



//          <img height="50px"' + (box_width - 5) +'px" 
//              src="http://cbk0.googleapis.com/cbk?output=thumbnail&cb_client=apiv3&v=4&panoid=' + 
//              panoramaStreetView.getPano() + '&yaw=' + panoramaStreetView.getPov()+ 
//              '&w=' + (box_width - 5) +'&h=50&thumb=2"></img>
//          <label class="gm-sv-label">Street View</label>
        }

        return str;
    };
// End: Set InfoWindow Content

// Start: Set street view panorama
    setStreetView = function(map, marker) {
        
        if (marker != null) {
// initialize street view panorama   
            var streetviewService = new google.maps.StreetViewService();
            var latitude = marker.getPosition().lat();
            var longitude = marker.getPosition().lng();
            var dataLatLng = new google.maps.LatLng(latitude, longitude);

            streetviewService.getPanoramaByLocation(dataLatLng, 
                100, function(result, status) {
                    if (status === google.maps.StreetViewStatus.OK) {
                        var panoramaSV = map.getStreetView();
                        panoramaSV.setPosition(result.location.latLng);
                        panoramaSV.setPov({
                            heading: 270,
                            pitch:0
                        });
                        $('#mode').hide();
                        panoramaSV.setVisible(true);
                    }
                }
            );
        };
    };

    
// $(document).on("click", "#myloc", function() {
//   if (document.getElementById("myloc").name === "Off") {
//     return document.getElementById("myloc").name = "On";
//   } else {
//     return document.getElementById("myloc").name = "On";
//   }
// });

// click on streetview thumbnail to open street view map
    $(document).on("click", "#svLink", function()  {
        var str = $(this).children("img").attr("src");
        str = str.split("location=").slice(1).join('');
        str = str.substring(0, str.indexOf("&heading"));
        var lat = str.substring(0, str.indexOf(","));
        var lng = str.split(",").slice(1).join('');

        for (var i=0; i< markers.length; i++) {
            if (markers[i].getPosition().lat() == lat && 
                markers[i].getPosition().lng() == lng) {
                setStreetView(map, markers[i]);
            } 
        }
    });

// click on marker name to open inforwindow on map
    $(document).on("click", ".markerName", function() {
        var i = $(this).attr("id");
      
        infowindow.close();
        infowindow = new google.maps.InfoWindow({maxWidth:400});

        var marker = markers[i];
            google.maps.event.trigger(marker, "click");
    });

    $(document).on("click", "#newloc", function() {
        $("#mapModal").modal("show");
        
        $("#mapModal").on("shown", function() {
            google.maps.event.trigger(map, "resize");
        });
    });

    $("[data-load-remote]").on("click", function(e) {
        e.preventDefault();
        var $this = $(this);
        var remote = $this.data("load-remote");
        if (remote) {
            $($this.data("remote-target")).load(remote);
        }
    });
});