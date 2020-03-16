window.addEventListener('load', function() {
    createMap();
    document.getElementById('requestVessels').addEventListener('click', function() {
        var self = this;
        // unpress the button if it's already activated
        document.getElementById('requestForecast').className = '';
        document.body.style.cursor = 'default';
        ENABLE_FORECAST = false;
        if (self.className != 'pressed') {
            if (urlParams.get('token') == null) {
                alert('Please include your Spire API token as a URL parameter:\n "?token=YOURTOKEN"');
                return;
            }
            self.className = 'pressed';
            document.body.style.cursor = 'crosshair';
            boxControl = new ol.interaction.DragBox({
                // condition: ol.events.condition.click,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 0, 255, 0.5)'
                    }),
                    stroke: new ol.style.Stroke({color: [0, 255, 255, 1]})
                })
            });
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
                // request 1000 vessels within this polygon
                requestVessels(1000, coordinates, boxCoords);
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
    fetch(uri, {headers:{'Authorization': 'Bearer ' + urlParams.get('token')}})
        .then((raw_response) => {
            return raw_response.json();
        })
        .then((response) => {
            console.log('Vessels API Response:', response);
            var geojson = convertResponseToGeoJson(response);
            createMapLayer(geojson);
            document.body.style.cursor = 'default';
        });
}

// convert Routing API response to valid GeoJSON
function convertResponseToGeoJson(resp) {
    var geojson = {};
    if (resp["data"]) {
        var data = resp["data"];
        var coordinates = [];
        for (var i=0; i < data.length; i++) {
            var vessel = data[i];
            var coords = vessel["last_known_position"]["geometry"]["coordinates"];
            var converted = ol.proj.fromLonLat(coords, "EPSG:3857");
            coordinates.push(converted);
        }
        geojson = {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "MultiPoint",
                    "coordinates": coordinates
                }
            }]
        };
    } else {
        console.log('Failure: API response does not contain vessels.')
    }
    return geojson;
}
