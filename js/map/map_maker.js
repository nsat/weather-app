function createVesselsLayer(geojson) {
    // console.log("Create Map Layer for:", geojson)
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojson)
    });
    var vectorLayer = new ol.layer.Vector({
        zIndex: 100,
        className: name,
        source: vectorSource,
        style: vesselStyle
    });
    window.ol_map.addLayer(vectorLayer);
}

function createMap(geojsonObject) {
    // clear the existing map element
    document.getElementById('map').innerHTML = '';

    // track map coordinates at the cursor's current position
    window.mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouseCoordinates'),
        undefinedHTML: '&nbsp;'
    });

    window.aoi_source = new ol.source.Vector({});
    window.aoi_layer = new ol.layer.Vector({
        source: window.aoi_source,
        style: aoiStyle,
        // zIndex: 100
    });
    window.forecast_source = new ol.source.Vector({});
    window.forecast_layer = new ol.layer.Vector({
        source: window.forecast_source,
        style: forecastPointStyle,
        zIndex: 99
    });
    // create the OpenLayers map and store it in a global variable
    window.ol_map = new ol.Map({
        controls: ol.control.defaults().extend([window.mousePositionControl]),
        layers: [
            new ol.layer.Tile({
                // free OpenStreetMap tileset
                source: new ol.source.OSM()
            }),
            window.aoi_layer,
            window.forecast_layer
        ],
        target: 'map',
        view: new ol.View({
            // // If the base map projection is set to 4326,
            // // code will need to change in other places,
            // // where conversions from 3857 are performed
            // projection: 'EPSG:4326', // default is EPSG:3857 (web mercator)
            projection: window.CRS,
            center: [0, 0],
            zoom: 2
        })
    });
    // keep track of hovered/selected forecast
    window.selectedForecast = null;
    window.hoveredForecast = null;
    // keep track of hovered/selected vessel
    window.selectedVessel = null;
    window.hoveredVessel = null;
    // map click/touch event listener
    window.ol_map.on('click', function(e) {
        // check that a map click won't trigger a forecast,
        // otherwise we don't allow any OpenLayers features to be selected
        if (window.ENABLE_FORECAST == false) {
            // check each feature at clicked pixel
            window.ol_map.forEachFeatureAtPixel(e.pixel, function(f) {
                // get the type of the selected feature
                var type = f.get('type');
                if (type == 'vessel') {
                    // check if there is a vessel already selected
                    if (window.selectedVessel !== null) {
                        // remove selected styling for current selection
                        window.selectedVessel.setStyle(undefined);
                    }
                    // set the global variable to the newly selected vessel
                    window.selectedVessel = f;
                    // style selected vessel as the red Spire logo
                    // so it's easy to differentiate from the other blue ship dots
                    f.setStyle(vesselSelectStyle);
                    // turn off hover styling
                    window.hoveredVessel = null;
                    var vessel_data = window.selectedVessel.get('data');
                    console.log('Selected vessel:', vessel_data);
                    document.getElementById('vesselInfo').innerHTML = '';
                    // display the vessel info popup
                    jsonView.format(vessel_data, '#vesselInfo');
                    document.getElementById('vesselPopup').style.display = 'block';
                } else if (type == 'forecast') {
                    // keep track of which forecast is selected
                    window.selectedForecast = f;
                    // this is always hidden by the weather graph popup
                    // so we don't add special selection styling here
                    // but we do turn off hover styling
                    window.hoveredForecast = null;
                    // always show the `medium_range_std_freq` forecast data by default
                    var forecast_data = window.selectedForecast.get(window.MEDIUM_RANGE_FORECAST);
                    console.log('Selected forecast:', forecast_data);
                    // display the weather graphs popup
                    displayForecastData(forecast_data, window.selectedForecast.getId());
                }
                return true;
            });
        } else {
            // window.ENABLE_FORECAST is set to true.
            // set cursor to spinning wheel immediately to show that the request has gone through.
            // we will set the cursor back to normal when the forecast API response is received.
            document.body.style.cursor = 'progress';
            document.getElementById('forecast_switch').style.cursor = 'progress';
            // we are already auto-storing the latitude/longitude coordinates of the current mouse position
            // so we can simply grab the content of the DOM element displaying those coordinates
            var coords = e.coordinate;
            // create the Forecast point feature
            var geometry = new ol.geom.Point(coords);
            var forecastPoint = new ol.Feature({
                geometry: geometry,
                type: 'forecast'
            });
            if (window.CRS == 'EPSG:3857') {
                // transform the coordinates from OpenLayers projection to standard lat-lon
                coords = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
            }
            // set an ID for this feature
            // so we can add the forecast data as a property once the API response comes through
            forecastPoint.setId(String(coords));
            // add the AOI feature to the existing Forecast layer
            window.forecast_source.addFeature( forecastPoint );
            // pass the [lon, lat] array in to our function for making a Point Forecast API request
            // and specify 6-hourly forecast for 7 days by default
            getPointForecast(coords, window.MEDIUM_RANGE_FORECAST);
        }
    });

    function removeHoverStyles() {
        // remove hover styling for currently hovered vessel
        if (window.hoveredVessel) {
            window.hoveredVessel.setStyle(undefined);
            window.hoveredVessel = null;
        }
        // remove hover styling for currently hovered forecast
        if (window.hoveredForecast) {
            window.hoveredForecast.setStyle(undefined);
            window.hoveredForecast = null;
        }
    }

    // mouse hover event listener
    window.ol_map.on('pointermove', function(e) {
        // check that a map click won't trigger a forecast,
        // otherwise we don't allow any OpenLayers features to be hovered
        if (window.ENABLE_FORECAST == false) {
            // reset cursor to default
            document.body.style.cursor = 'default';
            // remove hover styling for currently hovered vessel
            removeHoverStyles();
            // check each feature at hovered pixel
            window.ol_map.forEachFeatureAtPixel(e.pixel, function(f) {
                // change cursor to indicate some feature is being moused over
                document.body.style.cursor = 'pointer';
                // ensure only one feature is hovered at a time
                removeHoverStyles();
                // get the type of the selected feature
                var type = f.get('type');
                if (type == 'vessel') {
                    if (window.selectedVessel != f) {
                        // only set hover style on this vessel
                        // if it is not already currently selected
                        window.hoveredVessel = f;
                        window.hoveredVessel.setStyle(vesselHoverStyle);
                    }
                } else if (type == 'forecast') {
                    if (window.selectedForecast != f) {
                        // only set hover style on this forecast
                        // if it is not already currently selected
                        window.hoveredForecast = f;
                        window.hoveredForecast.setStyle(forecastHoverStyle);
                    }
                }
            });
        }
    });

}