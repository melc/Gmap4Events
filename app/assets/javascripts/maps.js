// initialize places address components
var addressForm = {
    street_number: "short_name",
    route: "long_name",
    locality: "long_name",
    administrative_area_level_1: "short_name",
    country: "long_name",
    postal_code: "short_name"
};

// initialize user's geolocator marker/pin
var SELF_ICON = "https://maps.google.com/mapfiles/kml/pushpin/pink-pushpin.png";
 
var MARKER_HEIGHT = 30, MARKER_WIDTH = 30;  // constant val of marker/pin size
var BOX_WIDTH = 320;                        // constant val of infowindow width
var SV_THUMBNAIL = BOX_WIDTH - 10;          // constant val of street view thumbnail width

var POV_HEADING = 145;                  // constant val of pov heading
var POV_PITCH = 0;                      // constant val of pov pitch

var SEARCH_TYPE = [];

var latitude = null;                // latitude of geolocation global var
var longitude = null;               // longitude of geolocation global var
var dataLatLng = null;              // lat and lng dataset global var
var selfGeoLocation = null;         // user's current location lat and lng dataset
var service = null;                 // text search service global var
var map = null;                     // map global var
var marker = null;                  // marker global var
var infowindow = null;              // infowindow global var
var bounds = null;                  // bounds global var
var directionsService = null;       // direction service global var
var directionsDisplay = null;       // directions renderer global var
/*
var panoramioLayer = null;          // panoramio layer global var
*/
var panoramaSV = null;              // street view panorama service
var streetviewPanorama = null;      // street view panorama service
var streetviewService = null;       // street view service global var
var autocomplete = null;            // autocomplete input location

// load on document ready or page load 
$(document).on('ready', function() {

    var markerDetails = [];  // initialize marker detail information
    var markers = [];       // initialize markers array of jSon

    // initialize user's current location detected by geolocator
    selfGeoLocation = new google.maps.LatLng();

    // initialize map, marker, bound, infowindow, and streetview service
    map = new google.maps.Map(document.getElementById("map-canvas"), {
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        streetViewControl: false
    });

    marker = new google.maps.Marker();
    user_marker = new google.maps.Marker();
    bounds = new google.maps.LatLngBounds();
    infowindow = new google.maps.InfoWindow({maxWidth:400});    

    streetviewPanorama = new google.maps.StreetViewPanorama(document.getElementById("map-canvas"));

    // initialize directionsservice and directionsrenderer
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    /*
    // initialize panoramio view
    panoramioLayer = new google.maps.panoramio.PanoramioLayer();  
    */

    // Create the autocomplete object, restricting the search
    // to geographical location types.
    // initialize searchbox autocomplete

    autocomplete = new google.maps.places.Autocomplete(
            document.getElementById("marker_location"), {types: []});

// initialize user's location on/off button
    $('#offSelfLoc').jqxSwitchButton({ height: 22, width: 51, checked: true });

// retrieve data 
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
        alert("Location search plugin is down! Check with tech support.");
    }

// End: find user's location

// Start: Location Searchbox Autocomplete
// When the user selects an address from the dropdown,
// populate the address fields in the hidden form.
    google.maps.event.addListener(autocomplete, "place_changed", function() {
        
// Get the place details from the autocomplete object.          
        var place = autocomplete.getPlace();

        if (place.geometry)  {
            var geoLoc = new google.maps.LatLng(place.geometry.location.lat(), place.geometry.location.lng());
            var title = place.name;
            var i = markers.length;
            var isFound = false;

            for (var i=0; i<markers.length; i++) {
                if (markers[i].getPosition().lat() ==  place.geometry.location.lat() && 
                    markers[i].getPosition().lng() ==  place.geometry.location.lng() && 
                    markers[i].getTitle() == title)  {
                    marker = markers[i];
                    isFound = true;
                }
            }
            
            if (isFound)
                google.maps.event.trigger(marker, "click");
            else  
                get_detail(place);
        }
        else {
            alert("The place cannot be found!");
            document.getElementById("marker_location").placeholder = "Enter Location or Business Name";
        }
    });

    function get_detail(place) {
        // var addressComponent, addressType, val;
        
// // Retrieve Places Details reponse address_component array item        
//         for (addressComponent in addressForm) {
//             document.getElementById(addressComponent).value = "";
//             document.getElementById(addressComponent).disabled = false;
//         }
        
// // Get each component of the address from the place details
// // and fill the corresponding field on the form        
//         for (var i=0; i<place.address_components.length; i++) {
//             addressType = place.address_components[i].types[0];
//             if (addressForm[addressType]) {
//                 val = place.address_components[i][addressForm[addressType]];
//                 document.getElementById(addressType).value = val;
//             }
//         }
        
// Retrieve Place Details response formatted_address, formatted_phone_number
// url, website, rating items
        var placeObject = new Object();

        placeObject.latitude = place.geometry.location.lat();
        placeObject.longitude = place.geometry.location.lng();
        placeObject.name = place.name;
        placeObject.formatted_address = place.formatted_address  ;
        placeObject.formatted_phone_number = place.formatted_phone_number;
        placeObject.url = place.url;
        placeObject.website = place.website;
        placeObject.rating = place.rating;
        placeObject.map_ref = place.reference;
        
        if (place.photos)
            placeObject.photos_url = place.photos[0].getUrl({'maxWidth': 100,'maxHeight': 100});
        else
            placeObject.photos_url = "";

        var placeData = JSON.stringify({ map: placeObject });

        $.ajax({
            type: "POST",
            url: "/maps/create", 
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            data:  placeData, 
            success: function (data) {
                createMarker(map, place.geometry.location, place.name, markers.length, false);
                setBounds(map, place.geometry.location);
                markerCluster = new MarkerClusterer(map, markers);
            },
            failure: function(errMsg) {
                alert(errMsg);
            }
        })
    };

// End: Location Searchbox Autocomplete

// Start: Build map
    function buildMap (GeoLoc, zoomVal) {
        streetviewPanorama.setVisible(false);
        map.setCenter(new google.maps.LatLng(GeoLoc.lat(), GeoLoc.lng()));
        map.setZoom(zoomVal);

        setUserMarker(map);
        setMarkers(map, markerDetails);
    };
// End: Build map

// Start: Add all markers onto map
    function setMarkers(map, markerDetails) {
        var geolocation = new google.maps.LatLng();

// add all cached markers onto map        
        for (var i=0; i<markerDetails.length; i++) {
            geolocation = new google.maps.LatLng(markerDetails[i].latitude, markerDetails[i].longitude);
            createMarker(map, geolocation, markerDetails[i].name, i, false);
            setBounds(map, geolocation);
        }
        var markerCluster = new MarkerClusterer(map, markers);
    };

// add marker of user's location onto map
    function setUserMarker(map) {
        createMarker(map, selfGeoLocation, "My Location", null, false);
        setBounds(map, selfGeoLocation);
    }

// Start: Set map bounds
    function setBounds(map, geoloc)  {
        bounds.extend(geoloc);
        map.fitBounds(bounds);
    }

// Start: Create a marker and insert into markers array
    function createMarker(map, GeoLoc, title, indexOfArray, isDraggable) {
        if (indexOfArray == null)
            iconUrl = SELF_ICON;
        else {
            var markerLetter = String.fromCharCode("A".charCodeAt(0) + indexOfArray);
            var iconUrl =  "https://maps.google.com/mapfiles/kml/paddle/" + markerLetter + ".png";
        }

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

        if (marker.getPosition() !== selfGeoLocation) {
            markers.push(marker);
        }
        else
            user_marker = marker;
        
// Start: event trigger when clicking on a marker
        google.maps.event.addListener(marker, "click", function() {

            $('div[role=markerSection]').css('backgroundColor', 'transparent');
            for (var i=markers.length-1; i>=0; i--) 
                if (marker.getPosition() == markers[i].getPosition() && marker.getTitle() == markers[i].getTitle())
                   
                    $('#markerSection'+i).css('backgroundColor', '#DCDCDC');
        
            openInfoWindow(map, marker);
        }); 
    }     

// End: Create a marker
        
// Start: Remove a marker from map
    function removeMarker(marker) {
        marker.setMap(null);
    };
// End: Remove a marker from map

// Start: Popup Infowindow
    function openInfoWindow(map, marker) {

        var contentStr = setupInfoWinContent(marker);
        var LatLng = marker.getPosition();

        infowindow.setContent(contentStr);
        infowindow.setPosition(LatLng);

        infowindow.open(map, marker);
    };
// End: Popup Infowindow        

// Start: Set InfoWindow Content
    function setupInfoWinContent(marker) {
        var address, name, rating, url;
        var box_width = BOX_WIDTH;
        var content = '';

        for (var i=0; i<markerDetails.length; i++) {
            if (marker.getPosition().lat() === markerDetails[i].latitude && 
                marker.getPosition().lng() === markerDetails[i].longitude) {
                name = markerDetails[i].name;
                address = markerDetails[i].formatted_address;

                rating = markerDetails[i].rating ? markerDetails[i].rating : "";
                url = markerDetails[i].url;

                phone_number = ! markerDetails[i].formatted_phone_number ? "" : markerDetails[i].formatted_phone_number;
                if (phone_number.toString() === 'undefined')
                    phone_number = '';

                website = ! markerDetails[i].website ? "" : markerDetails[i].website;
                if (website.toString() === 'undefined')
                    website = '';
            
                content = '<div class="infoboxStyle" style="width:' + box_width + 'px;">' +
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
                                '<div class="gm-website"><a href="' + website + '" target="_blank">' + decodeURI(website) + '</a></div>' +
                                '<div class="gm-phone">' + phone_number + '</div>' +
                            '</div>' +
                            '<div>' +
                            '<a name="map-canvas" class="gm-sv thumbnail" id="gm-sv'+i+'"><img src="https://maps.googleapis.com/maps/api/streetview/metadata?size=' +
                                SV_THUMBNAIL + 'x50&location=' +
                                markerDetails[i].latitude + ',' + markerDetails[i].longitude + '&heading=' + POV_HEADING + '&pitch=' + POV_PITCH  +
                                '&key=AIzaSyAbwdrxUNhLcukCQahR1ZdP7m6QSHae-KM' +
                                ' id="svThumbnail" /></a>' +
                            '</div>' +
                        '</div>';
            }

//          <img height="50px"' + SV_THUMBNAIL +'px" 
//              src="https://cbk0.googleapis.com/cbk?output=thumbnail&cb_client=apiv3&v=4&panoid=' +
//              panoramaStreetView.getPano() + '&yaw=' + panoramaStreetView.getPov()+ 
//              '&w=' + SV_THUMBNAIL +'&h=50&thumb=2"></img>
//          <label class="gm-sv-label">Street View</label>
        }
        return content;
    };
// End: Set InfoWindow Content

    function setStreetViewMap(objTag, index, map) {
        var src_str = objTag.children("img").attr("src");
        src_str = src_str.split("location=").slice(1).join('');
        src_str = src_str.substring(0, src_str.indexOf("&heading"));
        var lat = src_str.substring(0, src_str.indexOf(","));
        var lng = src_str.split(",").slice(1).join('');
        var latlng = new google.maps.LatLng(lat, lng);

        $('div[role=markerSection]').css('backgroundColor', 'transparent');
        openStreetViewMap(latlng, map);
        $('#markerSection'+index).css('backgroundColor', '#DCDCDC');
    }
    
    function openStreetViewMap(latlng, map) {
        
        streetviewService = new google.maps.StreetViewService();
        streetviewService.getPanoramaByLocation(latlng, 50, function(result, status) {
            if (status === google.maps.StreetViewStatus.OK) {
                streetviewPanorama = map.getStreetView();
                streetviewPanorama.setPosition(result.location.latLng);
                streetviewPanorama.setPov({
                    heading: POV_HEADING,
                    pitch: POV_PITCH
                });
                streetviewPanorama.setVisible(true);
            };
        });
    }

// Start: Show route directions on driving, walking, bicycling, or transit
    jQuery(function() {
    
        window.showRoute = function (mode, orig, dest) {
            calcRoute(map, mode, orig, dest);
        }
    });  
     
// Start: Draw route and direction, and display direction in a modal
    function calcRoute(map, mode, orig, dest) {
        
        directionsDisplay.setMap(map);

        directionsDisplay.setOptions( { 
            polylineOptions: {
                strokeColor: "darkgreen",
                strokeWeight: 4
            },
        });

        if (orig == 0) {
            var start = new google.maps.LatLng(selfGeoLocation.lat(), selfGeoLocation.lng());
            SELF_ROUTE = true;
        }
        else  
            var start = markers[orig-1].getPosition();
        
        if (dest == 0) {
            var end = new google.maps.LatLng(selfGeoLocation.lat(), selfGeoLocation.lng());
            SELF_ROUTE = true;
        }
        else  
            var end = markers[dest-1].getPosition();
    
        var selectedMode = $.trim(mode.toUpperCase());

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
        $("#mapModal .modal-title").text("Route Directions");
        directionsDisplay.setPanel(document.getElementById("mapModalBody"));
        
        $("#mapModal").on("shown", function() {
            google.maps.event.trigger(map, "resize");
        });
    };
// End: Draw driving route and direction, and display direction in a modal

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

// Start: close infowindow when clicking on a map focus on nothing
    google.maps.event.addListener(map, "click", function() {
        infowindow.close();
    });
// End: close infowindow

// click on marker name to open inforwindow on map
    $(document).on("click", ".markerName", function() {
        var i = $(this).attr("id");

        $('div[role=markerSection]').css("backgroundColor", "transparent");
        marker = markers[i];
    
        streetviewPanorama.setVisible(false);
        google.maps.event.trigger(marker, "click");
    });

// click on streetview thumbnail to open street view map
    $(document).on("click", ".svLink", function()  {
        var i = $(this).attr("id").split("svLink").slice(1).join('');
        setStreetViewMap($(this), i, map);
    });

// click on street view thumbnail to open screen view map
    $(document).on("click", ".gm-sv", function() {
        var i = $(this).attr("id").split("gm-sv").slice(1).join('');
        setStreetViewMap($(this), i, map);
    });

    $('input[name=searchRadios]').on('change', function() { 
        if($('input[name=searchRadios]:checked').val() == "Location") {
            document.getElementById("marker_location").placeholder = "Enter Location or Business Name";
            autocomplete = new google.maps.places.Autocomplete(
                document.getElementById("marker_location"), {types: []});
        }
        else {
            document.getElementById("marker_location").placeholder = "Hotel Near San Francisco or Marriot Near Montgomery Street San Francisco";
        }
    });

    $('input[id=marker_location]').on('mousedown keydown', function() {
        infowindow.close();
    });

    $(document).on('click', '#offSelfLoc', function (event) {
        if ($('#offSelfLoc').jqxSwitchButton('checked')) {
            removeMarker(user_marker);
            if (SELF_ROUTE == true)   {
                directionDisplay.setMap(null);
                $('#mode').html('Off Route <span class="caret"></span>');
            }
        }
        else   {
            createMarker(map, selfGeoLocation, 'My Location', null, false);
            setBounds(map, selfGeoLocation);
        }
        SELF_ROUTE = false;
    });

    $('#mode-menu li a').click(function() {
        $('#mode').html($(this).text()+' <span class="caret"></span>');
        var title = $(this).data('title');
        if ($.trim(title) == 'Off Route') 
            directionsDisplay.setDirections({ routes: [] }); 
        else
            $(".modal-title").text(title + " Route Origin and Destination");
    });

});