var TOKEN;

window.addEventListener('load', function() {
    createMap();
    document.getElementById('token').addEventListener('change', function(evt) {
        if (this.value != null) {
            TOKEN = this.value;
            document.getElementById('tokenPopup').style.display = 'none';
            document.getElementById('grayPageOverlay').style.display = 'none';
        }
    });
    document.getElementById('tokenForm').addEventListener('submit', function(evt) {
        evt.preventDefault(); // prevent page reload
        var token = document.getElementById('token').value;
        if (token != null) {
            TOKEN = token;
            document.getElementById('tokenPopup').style.display = 'none';
            document.getElementById('grayPageOverlay').style.display = 'none';
            // console.log("Form submitted with token value of: ", TOKEN);
        }
    });
    document.getElementById('closeVesselPopup').addEventListener('click', function() {
        document.getElementById('vesselPopup').style.display = 'none';
        document.getElementById('vesselInfo').innerHTML = '';
        if (window.selectedFeature) {
            window.selectedFeature.setStyle(undefined);
            window.selectedFeature = null;
        }
    });
    document.getElementById('requestVessels').addEventListener('click', function() {
        var self = this;
        // unpress the button if it's already activated
        document.getElementById('requestForecast').className = '';
        document.body.style.cursor = 'default';
        ENABLE_FORECAST = false;
        if (self.className != 'pressed') {
            if (TOKEN == null) {
                alert('Please include your Spire API token as a URL parameter:\n "?token=YOURTOKEN"');
                return;
            }
            self.className = 'pressed';
            document.body.style.cursor = 'crosshair';
            boxControl = new ol.interaction.DragBox({className: 'dragbox'});
            boxControl.on('boxend', function () {
                document.body.style.cursor = 'progress';
                // get coordinates of user-drawn box
                var boxCoords = boxControl.getGeometry().getCoordinates()[0];
                var coordinates = [];
                // convert each coordinate pair to standard projection
                for (var i=0; i < boxCoords.length; i++) {
                    var coords = boxCoords[i];
                    var converted = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
                    coordinates.push(converted);
                }
                // request 500 vessels within this polygon
                requestVessels(500, coordinates, boxCoords);
                // remove the DragBox control from the map
                window.ol_map.removeInteraction(boxControl);
                // return the trigger button to it's normal state
                self.className = '';
                window.drag_box = null;
            });
            window.ol_map.addInteraction(boxControl);
            window.drag_box = boxControl;
        } else {
            window.ol_map.removeInteraction(window.drag_box);
            self.className = '';
        }
    });
});

// use Spire Maritime's Vessels API
// to get the latest positions of n vessels
function requestVessels(number, coords, boxCoords) {
    var uri = 'https://api.sense.spire.com/vessels/';
    uri += '?limit=' + number;
    if (coords) {
        // draw the AOI box on the map
        createMapLayer({
            "type": "FeatureCollection",
            "properties": {"type": "bbox"},
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    // boxCoords are in EPSG:3857
                    "coordinates": [ boxCoords ]
                }
            }]
        });
        var polygon = {
            'type':'Polygon',
            // coords are in EPSG:4326
            'coordinates': [ coords ]
        };
        // build the URL parameter with encoded JSON
        var encoded = encodeURIComponent(JSON.stringify(polygon));
        uri += '&last_known_or_predicted_position_within=' + encoded;
    }
    console.log("GET", uri)
    fetch(uri, {headers:{'Authorization': 'Bearer ' + TOKEN}})
        .then((raw_response) => {
            return raw_response.json();
        })
        .then((response) => {
            console.log('Vessels API Response:', response);
            if (response['fault']) {
                // assume invalid API key and prompt re-entry
                document.getElementById('grayPageOverlay').style.display = 'block';
                document.getElementById('tokenPopup').style.display = 'block';
            }
            var geojson = convertResponseToGeoJson(response);
            createMapLayer(geojson);
            document.body.style.cursor = 'default';
        });
}

// convert Routing API response to valid GeoJSON
function convertResponseToGeoJson(resp) {
    var geojson = {};
    var features = [];
    if (resp["data"]) {
        var data = resp["data"];
        for (var i=0; i < data.length; i++) {
            var vessel = data[i];
            var coords = vessel["last_known_position"]["geometry"]["coordinates"];
            var converted = ol.proj.fromLonLat(coords, "EPSG:3857");
            features.push({
                "type": "Feature",
                "id": vessel['id'],
                "properties": {
                    "type": "vessel",
                    "data": vessel
                },
                "geometry": {
                    "type": "Point",
                    "coordinates": converted
                }
            });
        }
        geojson = {
            "type": "FeatureCollection",
            "properties": {"type": "vessels"},
            "features": features
        };
    } else {
        console.log('Failure: API response does not contain vessels.')
    }
    return geojson;
}
