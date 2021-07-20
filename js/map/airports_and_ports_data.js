function addAirportsToMap() {
    var airports = [
        [ 'Glasgow International Airport','EGPF',55.87189865,-4.433060169 ],
        [ 'Luxembourg-Findel International Airport','ELLX',49.6233333,6.2044444 ],
        [ 'Singapore Changi Airport','WSSS',1.35019,103.994003 ],
        [ 'Boulder Municipal Airport','KBDU',40.03939819,-105.2259979 ],
        [ 'San Francisco International Airport','KSFO',37.61899948,-122.375 ],
        [ 'Ronald Reagan Washington National Airport','KDCA',38.8521,-77.037697 ],
        [ 'Sydney Airport','YSSY',-33.95,151.18 ],
        [ 'Indira Gandhi International Airport','VIDP',28.5667,77.1167 ],
        [ 'Cape Town International Airport','FACT',-33.9715, 18.6021 ],
        [ 'Cairo International Airport','HECA',30.1167,31.3833 ],
        [ 'Ministro Pistarini International Airport','SAEZ',-34.82,-58.53 ],
        [ 'Santiago International Airport','SCEL',-33.38,-70.78 ],
        [ 'Mohammed V International Airport','GMMN',33.37,-7.58],
        [ 'Leonardo da Vinci International Airport','LIRF',41.80,12.23],
        [ 'Keflavik International Airport','BIKF',63.97,-22.60],
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
function addPortsToMap() {
    var ports = [
        [ 'Port of Houston','USHOU',29.72891386,-95.02049728 ],
        [ 'Port of Tokyo','JPTYO',35.60651382,139.7884196 ],
        [ 'Port of Amsterdam','NLAMS',52.40362156,4.842630109 ],
        [ 'Port of Vancouver','CAVAN',49.29154878,-122.8983521 ],
        [ 'Port of Santos','BRSSZ',-23.94578379,-46.33005747 ],
        [ 'Port of Shanghai','CNSHA',30.83565949,121.8203658 ],
        [ 'Port of Fujairah', 'AEFJR',25.20028261,56.3790265 ],
        [ 'Port of St. Petersburg', 'RULED',59.90243837, 30.23186257 ],
    ];
    // initialize features array
    var features = [];
    // iterate through each airport in the response
    for (var i=0; i < ports.length; i++) {
        var port = ports[i];
        // get this airport's last known position coordinates
        var name = port[0];
        var locode = port[1];
        var lat = port[2];
        var lon = port[3];
        var coords = [lon,lat];
        if (window.CRS == 'EPSG:3857') {
            // convert the coordinates to the projection used by OpenLayers
            coords = ol.proj.fromLonLat(coords, 'EPSG:3857');
        }
        // build the GeoJSON feature for this airport
        // and append it to the array of features for this layer
        features.push({
            'type': 'Feature',
            'id': locode,
            'properties': {
                // specify the type as a airport
                // so we can distinguish it from bounding box features
                // and apply mouse events only to airports
                'type': 'port',
                'name': name,
                'unlocode': locode
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
        'properties': {'type': 'ports'},
        'features': features
    };
    createMaritimePortsLayer(geojson);
}