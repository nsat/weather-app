// use Spire Maritime's Vessels API
// to get the latest positions of N number of vessels
function requestVessels(number, boxCoords) {
    var uri = 'https://api.sense.spire.com/vessels/';
    uri += '?limit=' + number;
    if (boxCoords) {
        // convert each coordinate pair to a different projection
        // since OpenLayers uses EPSG:3857 projection
        // but the Vessels API expects standard EPSG:4326 projection
        var stdCoords = [];
        for (var i=0; i < boxCoords.length; i++) {
            var coords = boxCoords[i];
            // convert the coordinates to the projection used by the Vessels API
            var converted = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
            stdCoords.push(converted);
        }
        var polygon = {
            'type':'Polygon',
            // stdCoords are in EPSG:4326
            'coordinates': [ stdCoords ]
        };
        // build the URL parameter with the JSON for the bounding box
        // and ensure that special characters are encoded properly for a URL
        var encoded = encodeURIComponent(JSON.stringify(polygon));
        // append the Vessels API parameter for a GeoJSON bounding polygon
        uri += '&last_known_position_within=' + encoded;
    }
    // print the full API request to the JS console
    console.log('GET', uri)
    // build the HTTP header for Authorization 
    var auth_header = {'Authorization': 'Bearer ' + window.TOKEN};
    // make the API request with the specified auth header
    fetch(uri, {headers: auth_header})
        .then((raw_response) => {
            // return the API response JSON
            // when it is received
            return raw_response.json();
        })
        .then((response) => {
            // print the API response to the JS console
            console.log('Vessels API Response:', response);
            // check if the API returned a fault/error
            if (response['fault']) {
                // assume invalid API key and prompt re-entry
                document.getElementById('grayPageOverlay').style.display = 'block';
                document.getElementById('tokenPopup').style.display = 'block';
                // notify the user that the API response failed
                alert('API response failed.\nPlease enter a valid API key.')
            } else {
                // convert the API response to the GeoJSON
                // expected by the OpenLayers map library
                var geojson = convertResponseToGeoJson(response);
                // create a new OpenLayers map layer
                // from the GeoJSON FeatureCollection of vessels
                createMapLayer(geojson);
            }
            document.body.style.cursor = 'default';
        });
}

// convert Routing API response to valid GeoJSON
function convertResponseToGeoJson(resp) {
    var geojson = {};
    var features = [];
    // first check that the API returned valid data 
    if (resp['data']) {
        var data = resp['data'];
        // iterate through each vessel in the response
        for (var i=0; i < data.length; i++) {
            var vessel = data[i];
            // get this vessel's last known position coordinates
            var coords = vessel['last_known_position']['geometry']['coordinates'];
            // convert the coordinates to the projection used by OpenLayers
            var converted = ol.proj.fromLonLat(coords, 'EPSG:3857');
            // build the GeoJSON feature for this vessel
            // and append it to the array of features for this layer
            features.push({
                'type': 'Feature',
                'id': vessel['id'],
                'properties': {
                    // specify the type as a vessel
                    // so we can distinguish it from bounding box features
                    // and apply mouse events only to vessels
                    'type': 'vessel',
                    // include all vessel data as a GeoJSON property
                    // so we can populate #vesselInfo in the #vesselPopup element
                    // when the user clicks on this feature
                    'data': vessel
                },
                'geometry': {
                    'type': 'Point',
                    'coordinates': converted
                }
            });
        }
        // create the full GeoJSON object
        // which will be used to create a unique map layer
        geojson = {
            'type': 'FeatureCollection',
            'properties': {'type': 'vessels'},
            'features': features
        };
    } else {
        // print error message to the JS console for debugging purposes
        console.log('Failure: API response does not contain vessels.', resp);
    }
    return geojson;
}
