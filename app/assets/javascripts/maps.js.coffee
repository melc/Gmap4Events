# # Place all the behaviors and hooks related to the matching controller here.
# # All this logic will automatically be available in application.js.
# # You can use CoffeeScript in this file: http://coffeescript.org/

# $(document).on 'ready page:load', ->

#     # initialize marker detail information
#     markerDetails = []

#     jQuery ->
#         markerDetails = maps

#     # initialize map, marker and infowindow
#     map = new google.maps.Map(document.getElementById("map-canvas"))
#     marker = new google.maps.Marker()

#     # initialize marker size
#     MARKER_HEIGHT = 30;
#     MARKER_WIDTH = 30;

# #    infowindow = new google.maps.InfoWindow(maxWidth: 400)

#     # initialize infowindow width
#     BOX_WIDTH = 300

#     # initialize directionsservice and directionsrenderer
#     directionsService = new google.maps.DirectionsService()
#     directionsDisplay = new google.maps.DirectionsRenderer()

#     # initialize markers array of jSon
#     markers = []

#     # initialize markers bounds
#     bounds = new google.maps.LatLngBounds()

#     # initialize panoramio view
#     # panoramioLayer = new google.maps.panoramio.PanoramioLayer()    
 
#     # Create the autocomplete object, restricting the search
#     # to geographical location types.
#     # initialize searchbox autocomplete
#     autocomplete = new google.maps.places.Autocomplete(document.getElementById("marker_location"), types: [])
   
#     alert selfGeoLocation
#     buildMap selfGeoLocation, 14 unless selfGeoLocation.nil?
    
#     # Start: Location Searchbox Autocomplete
#     # When the user selects an address from the dropdown,
#     # populate the address fields in the form.
#     google.maps.event.addListener autocomplete, "place_changed", ->
      
#         # Get the place details from the autocomplete object.      
#         place = autocomplete.getPlace()

#         # # Retrieve Places Details reponse address_component array item
#         # for addressComponent of addressForm
#         #     document.getElementById(addressComponent).value = ""
#         #     document.getElementById(addressComponent).disabled = false

#         # # Get each component of the address from the place details
#         # # and fill the corresponding field on the form.
#         # i = 0
#         # while i < place.address_components.length
#         #     addressType = place.address_components[i].types[0]
#         #     if addressForm[addressType]
#         #         val = place.address_components[i][addressForm[addressType]]
#         #         document.getElementById(addressType).value = val
#         #     i++

#         # Retrieve Place Details response formatted_address, formatted_phone_number
#         # url, website, rating items
#         document.getElementById("map_latitude").value = place.geometry.location.lat()
#         document.getElementById("map_longitude").value = place.geometry.location.lng() 
#         document.getElementById("map_name").value = place.name
#         document.getElementById("map_formatted_address").value = place.formatted_address 
#         document.getElementById("map_formatted_phone_number").value = place.formatted_phone_number
#         document.getElementById("map_url").value = place.url
#         document.getElementById("map_website").value = place.website
#         document.getElementById("map_rating").value = place.rating
#         document.getElementById("map_map_ref").value = place.reference
#         document.getElementById("map_photos_url").value = place.photos[0].getUrl({'maxWidth': 50, 'maxHeight': 50})
#     # End: Location Searchbox Autocomplete

#     # # Start: Create Panoramio View
#     # $('#panoramioView').on "click", ->
#     #     panoramioLayer.setMap map
#     #     photoPanel = document.getElementById("photo-panel")
#     #     map.controls[google.maps.ControlPosition.RIGHT_TOP].push photoPanel

#     # # End: Create Panoramio View

#     # # Start: Set Panoramio View InfoWindow
#     # google.maps.event.addListener panoramioLayer, "click", (photo) ->
#     #     li = document.createElement("li")
#     #     link = document.createElement("a")
#     #     link.innerHTML = photo.featureDetails.title + ": " + photo.featureDetails.author
#     #     link.setAttribute "href", photo.featureDetails.url
#     #     li.appendChild link
#     #     photoPanel.appendChild li
#     #     photoPanel.style.display = "block"
#     # # End: Set Panoramo View InfoWindow

#     # Start: Build map
#     buildMap = (GeoLoc, zoomVal) ->

#         map.setCenter(new google.maps.LatLng(GeoLoc.lat(), GeoLoc.lng()))
#         map.setZoom(zoomVal)
#         map.setMapTypeId(google.maps.MapTypeId.ROADMAP)

#         setMarkers map, markerDetails
        
#         $(document).on "change", "#mode", ->
#             calcRoute map
#     # End: Build map

#     setMarkers = (map, markerDetails) ->
#         # add marker of user's location onto map
#         selfIcon = "http://maps.google.com/mapfiles/kml/pushpin/pink-pushpin.png"
#         addMarker map,selfGeoLocation, "My Location", selfIcon, false        

#         i = 0
#         while i < markerDetails.length
#             geolocation = new google.maps.LatLng(markerDetails[i].latitude, markerDetails[i].longitude)
#             markerLetter = String.fromCharCode("A".charCodeAt(0) + i)
#             markerIcon = "http://maps.google.com/mapfiles/kml/paddle/" + markerLetter + ".png"
#             bounds.extend(geolocation)          
#             addMarker map, geolocation, markerDetails[i].name,  markerIcon, false
#             i++

#         map.fitBounds(bounds);
#         markerCluster = new MarkerClusterer(map, markers);

#     # Start: Add marker onto Map
#     addMarker = (map, GeoLoc, title, iconUrl, isDraggable) ->
#         marker = new google.maps.Marker(
#             position: GeoLoc
#             map: map
#             title: title
#             draggable: isDraggable
#             animation: google.maps.Animation.DROP
#             icon: 
#                 url: iconUrl
#                 size: new google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT)
#                 scaledSize: new google.maps.Size(MARKER_WIDTH, MARKER_HEIGHT)
#         )

#         str = setupInfoWinContent(marker, BOX_WIDTH)
#         # setStreetView map, marker
#         attachInfoWindow str, marker

#         if marker.getPosition() isnt selfGeoLocation
#             markers.push marker  
#     # End: Add a marker onto map
        
#     # Start: Remove a marker from map
#     removeMarker = (marker) ->
#         marker.setMap null
#     # End: Remove a marker from map

#     # Start: Draw route and direction, and display direction in a modal
#     calcRoute = (map) ->
#         directionsDisplay.setMap map
#         start = new google.maps.LatLng(selfGeoLocation.lat(), selfGeoLocation.lng())
#         end = new google.maps.LatLng(markerDetails[0].latitude, markerDetails[0].longitude)
#         selectedMode = document.getElementById("mode").value
#         request =
#             origin: start
#             destination: end
#             travelMode: google.maps.TravelMode[selectedMode]

#         directionsService.route request, (response, status) ->
#             directionsDisplay.setDirections response  if status is google.maps.DirectionsStatus.OK

#         $("#mapModal").modal "show"
#         directionsDisplay.setPanel document.getElementById("mapModalBody")
#         $("#mapModal").on "shown", ->
#             google.maps.event.trigger map, "resize"
#     # End: Draw driving route and direction, and display direction in a modal

#     # Start: Popup Infowindow
#     attachInfoWindow = (contentStr, marker) ->

#         infowindow = new google.maps.InfoWindow(
#             content: contentStr
#             maxWidth: 400
#         )
        
#         google.maps.event.addListener marker, "click", ->
#             infowindow.open map, marker
#     # End: Popup Infowindow        

#     # Start: Set InfoWindow Content
#     setupInfoWinContent = (marker, BOX_WIDTH) ->

#         box_width = BOX_WIDTH
#         str = ''
#         i = 0
#         while i < markerDetails.length
#             if marker.getPosition().lat() is markerDetails[i].latitude and marker.getPosition().lng() is markerDetails[i].longitude
#                 name = markerDetails[i].name 
#                 address = markerDetails[i].formatted_address
#                 markerDetails[i].formatted_phone_number = "" if markerDetails[i].formatted_phone_number.toString() is "undefined"
#                 rating = markerDetails[i].rating
#                 url = markerDetails[i].url
#                 markerDetails[i].website = "" if markerDetails[i].website.toString() is "undefined"
#                 markerDetails[i].photos_url = "" if markerDetails[i].photos_url.toString() is "undefined"


#                 str = 
#                     '<div class="infoboxStyle" style="width:' + box_width + 'px;">
#                         <div>
#                             <span class="gm-title">&nbsp;&nbsp;' + name + '&nbsp;&nbsp;&nbsp;</span>
#                             <span class="gm-more"><a href="' + url + '" target="_blank">more info</a></span>                            
#                         </div>
#                         <div class="gm-rev">
#                             <span class="gm-rating">' + rating + '</span>
#                             <span>
#                                 <div class="gm-stars-b"> 
#                                     <div class="gm-stars-f" style="width:' + (65 * rating / 5) + 'px;"></div>
#                                 </div>
#                             </span>
#                         </div>
#                         <div class="gm-basicinfo">
#                             <div class="gm-addr">' + address + '</div>
#                             <div class="gm-website"><a href="' + markerDetails[i].website + '" target="_blank">' + decodeURI(markerDetails[i].website) + '</a></div>         
#                             <div class="gm-phone">' + markerDetails[i].formatted_phone_number + '</div>
#                         </div>
#                     </div>'
#             i++
#     #        <img height="50px"' + (box_width - 5) +'px" 
#     #             src="http://cbk0.googleapis.com/cbk?output=thumbnail&cb_client=apiv3&v=4&panoid=' + 
#     #         panoramaStreetView.getPano() + '&yaw=' + panoramaStreetView.getPov()+ '&w=' + (box_width - 5) +'&h=50&thumb=2"></img>
#     #         <label class="gm-sv-label">Street View</label>
#         infoStr = str
#     # End: Set InfoWindow Content

#     # # set street view panorama
#     # # setStreetView = (map, marker) ->
#     # #     if marker?
#     # #         # initialize street vie panoramio
#     # #         streetviewService = new google.maps.StreetViewService()
#     # #         latitude = marker.getPosition().lat()
#     # #         longitude = marker.getPosition().lng()

#     # #         dataLatLng = new google.maps.LatLng(latitude, longitude)
#     # #         streetviewService.getPanoramaByLocation dataLatLng, 50, (result, status) ->

#     # #             alert result
#     # #             if status is google.maps.StreetViewStatus.OK
#     # #                 alert result.location.latLng
#     # #                 panoramaSV = map.getStreetView()
#     # #                 panoramaSV.setPosition result.location.latLng
#     # #                 # panoramaSV.setVisible true


#     $(".markerName").on "click", ->
#         i = $(this).attr("id")
#         marker = markers[i]
#         google.maps.event.trigger marker, "click"
        
#     # $(".gm-sv").on "click", ->
#     #     panoramaStreetView.setVisible true


#     # $(document).on "click", "#myloc", ->
#     #     if document.getElementById("myloc").name == "Off"
#     #         document.getElementById("myloc").name = "On"
#     #     else
#     #         document.getElementById("myloc").name = "On"

#     $(document).on "click", "#newloc", ->

#         $("#mapModal").modal "show"
#         $("#mapModal").on "shown", ->
#             google.maps.event.trigger map, "resize"

#     $("[data-load-remote]").on "click", (e) ->
#       e.preventDefault()
#       $this = $(this)
#       remote = $this.data("load-remote")
#       $($this.data("remote-target")).load remote if remote

# # addressForm =
# #     street_number: "short_name"
# #     route: "long_name"
# #     locality: "long_name"
# #     administrative_area_level_1: "short_name"
# #     country: "long_name"
# #     postal_code: "short_name"