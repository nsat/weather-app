function createVesselsLayer(geojson) {
    // console.log("Create Map Layer for:", geojson)
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojson)
    });
    var vectorLayer = new ol.layer.Vector({
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
    window.forecast_source = new ol.source.Vector({});
    // create the OpenLayers map and store it in a global variable
    window.ol_map = new ol.Map({
        controls: ol.control.defaults().extend([window.mousePositionControl]),
        layers: [
            new ol.layer.Tile({
                // free OpenStreetMap tileset
                source: new ol.source.OSM()
            }),
            new ol.layer.Vector({
                source: window.aoi_source,
                style: aoiStyle,
                // zIndex: 100
            }),
            new ol.layer.Vector({
                source: window.forecast_source,
                style: forecastPointStyle,
                // zIndex: 100
            })
        ],
        target: 'map',
        view: new ol.View({
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
    // click event listener
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

    // hover event listener
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

    // add event listener to download button
    // so the map and its layers can be downloaded as an image
    enableMapDownload();
}