function addAirportsToMap() {
    var airports = [
        [ 'Glasgow International Airport','EGPF',55.87189865,-4.433060169 ],
        [ 'Luxembourg-Findel International Airport','ELLX',49.6233333,6.2044444 ],
        [ 'Singapore Changi Airport','WSSS',1.35019,103.994003 ],
        [ 'Boulder Municipal Airport','KBDU',40.03939819,-105.2259979 ],
        [ 'San Francisco International Airport','KSFO',37.61899948,-122.375 ],
        [ 'Ronald Reagan Washington National Airport','KDCA',38.8521,-77.037697 ]
    ];
    // initialize features array
    var features = [];
    // iterate through each airport in the response
    for (var i=0; i < airports.length; i++) {
        var airport = airports[i];
        // get this airport's last known position coordinates
        var name = airport[0];
        var icao = airport[1];
        var lat = airport[2];
        var lon = airport[3];
        var coords = [lon,lat];
        if (window.CRS == 'EPSG:3857') {
            // convert the coordinates to the projection used by OpenLayers
            coords = ol.proj.fromLonLat(coords, 'EPSG:3857');
        }
        // build the GeoJSON feature for this airport
        // and append it to the array of features for this layer
        features.push({
            'type': 'Feature',
            'id': icao,
            'properties': {
                // specify the type as a airport
                // so we can distinguish it from bounding box features
                // and apply mouse events only to airports
                'type': 'airport',
                'name': name,
                'icao': icao
            },
            'geometry': {
                'type': 'Point',
                'coordinates': coords
            }
        });
    }
    // create the full GeoJSON object
    // which will be used to create a unique map layer
    geojson = {
        'type': 'FeatureCollection',
        'properties': {'type': 'airports'},
        'features': features
    };
    createAirportsLayer(geojson);
}