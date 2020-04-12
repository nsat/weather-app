// wait to execute the following code block until the page has fully loaded,
// ensuring that all HTML elements referenced here have already been created
window.addEventListener('load', function() {
    // set the CRS globally for convenience.
    // we will use this to specify the OpenLayers map CRS
    // and to determine which transforms are needed
    // elsewhere in the code
    window.CRS = 'EPSG:4326';
    // window.CRS = 'EPSG:3857';

    // initialize the OpenLayers base map
    createMap();

    // initialize variable for storing full WMS capabilities
    window.Full_WMS_XML = {};
    // initialize variable for storing the WMS options we will
    // make available to the user for configuration in the UI
    window.Latest_WMS = {};
    // initialize variable for storing the currently selected
    // WMS options (for both possible layers, indexed as '0' or '1')
    window.Current_WMS_Layer = {};
    // initialize quick lookup for available WMS times of current layers
    window.WMS_Animation_Times = [];
    // initialize variable for tracking the current index
    // of the WMS array of time values, used for animating WMS layers
    window.WMS_Animation_Time_Index = 0;
    // global variables for specifying the forecast time bundles
    window.MEDIUM_RANGE_FORECAST = 'medium_range_std_freq';
    window.SHORT_RANGE_FORECAST = 'short_range_high_freq';
    // global variable for toggling get-forecast-on-map-click
    window.ENABLE_FORECAST = false;
    // set a global variable for easy access of URL parameters
    // which are used for various configuration options
    window.urlParams = new URLSearchParams(window.location.search);

    // handler for token input form submission
    document.getElementById('tokenForm').addEventListener('submit', function(evt) {
        // prevent the default behavior of a page reload on submit
        evt.preventDefault();
        // check to make sure an actual value has been submitted for the token
        var token = document.getElementById('token').value;
        if (token != null && token != '') {
            // naively set the global token variable, assuming the user-specified token is valid.
            // if any future API request fails due to authentication, the token popup will open again. 
            window.TOKEN = token;
            // disable the popup and app overlay for now since `token` value is not null
            document.getElementById('tokenPopup').style.display = 'none';
            document.getElementById('grayPageOverlay').style.display = 'none';
            // make async requests for the WMS capabilities
            // of the currently available bundles
            getWMSCapabilities('basic');
            // get Maritime WMS unless we're in the agricultural context
            if (window.urlParams.get('bundles') != 'agricultural') {
                getWMSCapabilities('maritime');
            }
        }
    });

    // handler for token input value change
    document.getElementById('token').addEventListener('change', function(evt) {
        // as long as there is a real value in the input field when the DOM element loses focus,
        // we handle the value change as if it were an explicit form submission.
        // this has the side effect of submitting the autofilled form on any mouse or key event after page load.
        if (this.value != null) {
            // set the global token value which we will later use
            // to pass in to every API request
            window.TOKEN = this.value;
            // hide the token popup form
            document.getElementById('tokenPopup').style.display = 'none';
            // hide the gray page overlay
            document.getElementById('grayPageOverlay').style.display = 'none';
        }
    });

    // toggle popup for selecting a WMS layer
    document.getElementById('configureWMS').addEventListener('click', function() {
        if (document.getElementById('configureWMS').className != 'pressed') {
            document.getElementById('wmsPopup').style.display = 'block';
            document.getElementById('configureWMS').className = 'pressed';
        } else {
            document.getElementById('wmsPopup').style.display = 'none';
            document.getElementById('configureWMS').className = '';
        }
    });

    // toggle popup for WMS layer's legend image
    document.getElementById('show_legend_0').addEventListener('click', function() {
        if (document.getElementById('show_legend_0').className != 'pressed') {
            document.getElementById('show_legend_0').className = 'pressed';
            // make the legend image visible
            document.getElementById('legend_wms_0').style.display = 'inline-block';
        } else {
            document.getElementById('show_legend_0').className = '';
            // hide the legend image
            document.getElementById('legend_wms_0').style.display = 'none';
        }
    });
    // toggle popup for WMS layer's legend image
    document.getElementById('show_legend_1').addEventListener('click', function() {
        if (document.getElementById('show_legend_1').className != 'pressed') {
            document.getElementById('show_legend_1').className = 'pressed';
            // make the legend image visible
            document.getElementById('legend_wms_1').style.display = 'inline-block';
        } else {
            document.getElementById('show_legend_1').className = '';
            // hide the legend image
            document.getElementById('legend_wms_1').style.display = 'none';
        }
    });

    // enable the WMS legend popups to be dragged around on the screen
    makeElementDraggable(document.getElementById('legend_wms_0'));
    makeElementDraggable(document.getElementById('legend_wms_1'));
    // enable the WMS Config popup to be dragged around on the screen
    makeElementDraggable(document.getElementById('wmsPopup'));
    // enable the WMS time popup to be dragged around on the screen
    makeElementDraggable(document.getElementById('wmsTimePopup'));
    // click handler for for playing WMS time forward or stopping WMS time playback
    document.getElementById('wms_play_stop').addEventListener('click', function() {
        if (window.WMS_Animation == null) {
            // play WMS time forward
            // starting at the current time index
            playWMS();
            // switch to a 'pause' icon
            this.className = 'pause';
        } else {
            // stop WMS time playback
            // but do not change the time index
            stopWMS();
            // switch to a 'play' icon
            this.className = 'play';
        }
    });
    // handler for WMS time slider while it is moving
    document.getElementById('wms_time_slider').addEventListener('input', function() {
        if (window.WMS_Animation_Times.length > 0) {
            // use the integer value of the slider
            // to set the WMS time index
            var time = window.WMS_Animation_Times[this.value];
            // only change the time display, don't actually set the time
            changeWMSTimeDisplay(time);
        } else {
            // reset slider to starting position
            // if no WMS times are available
            this.value = 0;
        }
    });
    // handler for WMS time slider change (after mouse up)
    document.getElementById('wms_time_slider').addEventListener('change', function() {
        if (window.WMS_Animation_Times.length > 0) {
            // use the integer value of the slider
            // to set the WMS time index
            setWMSTime(window.WMS_Animation_Times[this.value]);
        } else {
            // reset slider to starting position
            // if no WMS times are available
            this.value = 0;
        }
    });
    // button for toggling map overlay time display
    document.getElementById('popout_time').addEventListener('click', function() {
        if (this.className != 'pressed') {
            this.className = 'pressed';
            // make the time popup visible
            document.getElementById('wmsTimePopup').style.display = 'block';
        } else {
            // hide the time popup
            this.className = '';
            document.getElementById('wmsTimePopup').style.display = 'none';
        }
    });

    // configure the styles dropdown based on the selected WMS layers
    function selectWMSAndPopulateStyles(num) {
        var times = [];
        var style = null;
        var legend_url = null;
        var layer_selector = document.getElementById('wms_layer_select_' + num);
        var layer_title = layer_selector.options[layer_selector.selectedIndex].value;
        if (layer_title == 'none') {
            // get the style selector
            var style_selector = document.getElementById('wms_style_select_' + num);
            // clear the style selector contents
            style_selector.innerHTML = null;
            // make sure the style selector is no longer visible
            document.getElementById('wms_config_style_' + num).style.display = 'none';
        } else {
            // get the times associated with the selected layer
            var times = window.Latest_WMS[layer_title]['times'];
            // get the styles associated with the selected layer
            var styles = window.Latest_WMS[layer_title]['styles'];
            // get the style selector
            var style_selector = document.getElementById('wms_style_select_' + num);
            // clear the style selector contents
            style_selector.innerHTML = null;
            // make sure the style selector is visible
            document.getElementById('wms_config_style_' + num).style.display = 'inline-block';
            // build the style dropdown contents
            var style_names = Object.keys(styles);
            style_names.forEach(function(name) {
                var option = document.createElement('OPTION');
                if (num == '1' && name.indexOf('nearest') != -1) {
                    // don't set a value for the default layer style
                    // for the "overlay" WMS layer
                } else {
                    option.value = name;
                }
                option.textContent = name;
                // add option to dropdown
                style_selector.appendChild(option);
            });
            // select the last listed style by default for the second "overlay" dropdown
            // since it is meant to be a contour line on top of the first "base" dropdown
            if (num == '1') {
                style_selector.selectedIndex = style_selector.options.length - 1;
            }
            style = style_selector.options[style_selector.selectedIndex].value;
            legend_url = styles[style];
        }
        var layer_name = 'none';
        if (window.Latest_WMS[layer_title]['name']) {
            layer_name = window.Latest_WMS[layer_title]['name'];
        }
        return [
            layer_name,
            style,
            times,
            legend_url
        ];
    }

    // configure the styles dropdown based on the selected WMS layers
    function selectNewStyleForWMS(num) {
        // get selected layer 
        var layer_selector = document.getElementById('wms_layer_select_' + num);
        var layer_title = layer_selector.options[layer_selector.selectedIndex].value;
        var layer_name = window.Latest_WMS[layer_title]['name'];
        // get the times associated with the selected layer
        var times = window.Latest_WMS[layer_title]['times'];
        // get selected style
        var style_selector = document.getElementById('wms_style_select_' + num);
        var style = style = style_selector.options[style_selector.selectedIndex].value;
        var legend_url = window.Latest_WMS[layer_title]['styles'][style];
        return [
            layer_name,
            style,
            times,
            legend_url
        ];
    }

    // add the first WMS layer when a Layer is selected from the first Layer dropdown
    document.getElementById('wms_layer_select_0').addEventListener('change', function() {
        var layer_index = '0';
        var selections = selectWMSAndPopulateStyles(layer_index);
        var layer_name = selections[0];
        var style = selections[1];
        var times = selections[2];
        var legend_url = selections[3];
        addWMSLayer(layer_name, style, layer_index, times, legend_url);
    });
    // add the first WMS layer when a Style is selected from the first Style dropdown
    document.getElementById('wms_style_select_0').addEventListener('change', function() {
        var layer_index = '0';
        var selections = selectNewStyleForWMS(layer_index);
        var layer_name = selections[0];
        var style = selections[1];
        var times = selections[2];
        var legend_url = selections[3];
        addWMSLayer(layer_name, style, layer_index, times, legend_url);
    });

    // add the second WMS layer when a Layer is selected from the second Layer dropdown
    document.getElementById('wms_layer_select_1').addEventListener('change', function() {
        var layer_index = '1';
        var selections = selectWMSAndPopulateStyles(layer_index);
        var layer_name = selections[0];
        var style = selections[1];
        var times = selections[2];
        var legend_url = selections[3];
        addWMSLayer(layer_name, style, layer_index, times, legend_url);
    });
    // add the second WMS layer when a Style is selected from the second Style dropdown
    document.getElementById('wms_style_select_1').addEventListener('change', function() {
        var layer_index = '1';
        var selections = selectNewStyleForWMS(layer_index);
        var layer_name = selections[0];
        var style = selections[1];
        var times = selections[2];
        var legend_url = selections[3];
        addWMSLayer(layer_name, style, layer_index, times, legend_url);
    });

    // enable box-drawing tool to crop WMS region by setting layer extents
    document.getElementById('cropWMSExtent').addEventListener('click', function() {
        var self = this;
        document.body.style.cursor = 'default';
        // disable point forecast selection in case it's activated
        ENABLE_FORECAST = false;
        // check if button is already pressed
        if (self.className != 'pressed') {
            self.className = 'pressed';
            document.body.style.cursor = 'crosshair';
            document.getElementById('map').style.cursor = 'crosshair';
            var boxControl = new ol.interaction.DragBox({
                // condition: ol.events.condition.click,
                className: 'wmsCropBox',
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 0, 255, 0.5)'
                    }),
                    stroke: new ol.style.Stroke({color: [0, 255, 255, 1]})
                })
            });
            boxControl.on('boxend', function () {
                // get extent of user-drawn box
                var extent = boxControl.getGeometry().getExtent();
                // set the extent for the WMS layer
                setWMSExtent(extent);
                self.className = '';
                // remove the DragBox control from the map
                window.ol_map.removeInteraction(window.wms_crop);
                // return the trigger button to it's normal state
                window.wms_crop = null;
                // reset cursor style
                document.body.style.cursor = 'default';
                document.getElementById('map').style.cursor = 'default';
            });
            window.ol_map.addInteraction(boxControl);
            window.wms_crop = boxControl;
        } else {
            // unpress the button if it's already activated
            // and revert out of the DragBox mode
            self.className = '';
            window.ol_map.removeInteraction(window.wms_crop);
            window.wms_crop = null;
            // reset cursor style
            document.body.style.cursor = 'default';
            document.getElementById('map').style.cursor = 'default';
        }
    });

    // close the WMS popup when the X button is clicked
    document.getElementById('closeWMSPopup').addEventListener('click', function() {
        document.getElementById('wmsPopup').style.display = 'none';
        document.getElementById('configureWMS').className = '';
    });

    // button handler for enabling point forecast on map click
    document.getElementById('requestForecast').onclick = function() {
        // check if button is already pressed
        if (this.className != 'pressed') {
            // disable area selection
            // since it interferes with selecting a point forecast
            if (window.draw_tool != null) {
                window.ol_map.removeInteraction(window.draw_tool);
                document.getElementById('drawPolygonArea').className = '';
            }
            // change button style to indicate it has been pressed
            this.className = 'pressed';
            // change the cursor to indicate a new mode has been entered
            // where clicking on the map will request a point forecast
            document.body.style.cursor = 'crosshair';
            // enable the forecast flag
            window.ENABLE_FORECAST = true;
        } else {
            // unpress the button if it's already activated
            this.className = '';
            // reset the cursor to default
            document.body.style.cursor = 'default';
            // disable the forecast flag
            window.ENABLE_FORECAST = false;
        }
    };

    // change forecast toggle UI and get new forecast
    document.getElementById('forecast_switch').addEventListener( 'change', function(evt, elem) {
        if (elem == null) {
            elem = evt.target;
        }
        // the forecast toggle is not visible unless a forecast is being displayed
        // so we first need to get the feature ID of the current forecast
        // which happens to be a stringified version of the [lon,lat] array
        var forecast_feature_id = window.FORECAST_COORDINATE;
        var forecast_feature = window.forecast_source.getFeatureById(forecast_feature_id);
        // check state of toggle switch
        if (elem.checked) {
            // change from 7day forecast to 24hr forecast
            document.getElementById('day').className = 'selected';
            document.getElementById('week').className = '';
            // 24hr forecast data is already retrieved and stored
            // so we just need to build the graphs for it
            displayForecastData(
                forecast_feature.get(window.SHORT_RANGE_FORECAST),
                forecast_feature_id
            );
        } else {
            // change from 24hr forecast to 7day forecast
            document.getElementById('day').className = '';
            document.getElementById('week').className = 'selected';
            // 7day forecast data is already retrieved and stored
            // so we just need to build the graphs for it
            displayForecastData(
                forecast_feature.get(window.MEDIUM_RANGE_FORECAST),
                forecast_feature_id
            );
        }
    });

    // enable the weather graphs popup to be dragged around on the screen
    makeElementDraggable(document.getElementById('weatherGraphsPopup'));

    // function for closing the Weather Point Forecast graphs popup...
    function closeForecastPopup() {
        // hide the weather graphs popup
        document.getElementById('weatherGraphsPopup').style.display = 'none';
        // hide the gray page overlay
        document.getElementById('grayPageOverlay').style.display = 'none';
        // reset the day/week toggle switch so it's initiated properly for the next forecast
        document.getElementById('day').className = '';
        document.getElementById('week').className = 'selected';
        document.getElementById('forecast_switch').checked = false;
        // un-select the forecast since it's no longer being inspected
        if (window.selectedForecast) {
            window.selectedForecast.setStyle(undefined);
            window.selectedForecast = null;
        }
    }
    // ...when the user clicks on the X button of the weather graphs popup...
    document.getElementById('closeWeatherGraphsPopup').onclick = function() {
        // close the forecast popup
        closeForecastPopup();
    }
    // ... or when the user clicks outside of the popup window on the gray page overlay
    document.getElementById('grayPageOverlay').onclick = function() {
        // the gray page overlay is also active when the token popup is visible
        // so first make sure that the token popup is not open
        if (window.TOKEN && document.getElementById('tokenPopup').style.display == 'none') {
            // then close the forecast popup
            closeForecastPopup();
        }
    };

    document.getElementById('drawPolygonArea').addEventListener('click', function() {
        // create an alias for clicked button element
        // so we can refer to it in other event handlers
        var self = this;
        // un-press the forecast button if it's already activated
        document.getElementById('requestForecast').className = '';
        // disable the global forecast flag / point forecast on map click
        window.ENABLE_FORECAST = false;
        // return the cursor to default state
        document.body.style.cursor = 'default';
        // ensure the vessels button isn't already pressed
        if (self.className != 'pressed') {
            // change button style to indicate it has been pressed
            self.className = 'pressed';
            // change the cursor to indicate a new mode has been entered
            // where clicking on the map will request a point forecast
            document.body.style.cursor = 'cell';
            // initialize the tool to draw a polygon
            var drawSource = new ol.source.Vector({
                wrapX: false
            });
            var drawControl = new ol.interaction.Draw({
                source: drawSource,
                type: 'Polygon',
                freehandCondition: function(){return false;},
                // // custom styling for draw tool
                // style: new ol.style.Style({
                //     fill: new ol.style.Fill({
                //         color: 'rgba(0, 60, 136, 0.2)'
                //     }),
                //     stroke: new ol.style.Stroke({
                //         width: 3,
                //         color: 'rgba(0, 60, 136, 0.7)'
                //     })
                // })
            });
            drawSource.on('addfeature', function(evt){
                var feature = evt.feature;
                var drawCoords = feature.getGeometry().getCoordinates()[0];
                // create the Area Of Interest polygon feature
                var aoiPolygon = new ol.Feature({
                    geometry: feature.getGeometry(),
                    // specify the type as an Area Of Interest polygon
                    // so we can distinguish it from vessel features
                    // and ignore mouse events on the AOI
                    type: 'aoi'
                });
                // add the AOI feature to the existing AOI layer
                window.aoi_source.addFeature( aoiPolygon );
                // only request vessels in the area if we're in the Maritime context
                if (window.urlParams.get('bundles') != 'agricultural') {
                    // request 500 vessels within this polygon
                    requestVessels(500, drawCoords);
                }
                // remove the DrawPolygon control from the map
                window.ol_map.removeInteraction(drawControl);
                // return the trigger button to it's normal state
                self.className = '';
                // reset the global draw_tool variable to null
                window.draw_tool = null;
                // reset the cursor to default
                document.body.style.cursor = 'default';
            });
            // set the global raw tool variable
            // so we can check for context in other event handlers
            window.draw_tool = drawControl;
            // add the draw tool interaction to the OpenLayers map
            window.ol_map.addInteraction(window.draw_tool);
        } else {
            // remove the draw tool interaction from the OpenLayers map
            window.ol_map.removeInteraction(window.draw_tool);
            // un-press the button since it's currently pressed
            self.className = '';
        }
    });

    // check if the `agricultural` URL parameter has been specified,
    // in which case we will hide the maritime-specific features
    if (window.urlParams.get('bundles') == 'agricultural') {
        // change button text to indicate
        document.getElementById('drawPolygonArea').textContent = 'Draw Polygon Area';
    } else {
        // Maritime-specific event handlers:
        //
        // change button text to indicate a Vessels API request will be sent
        // after the polygon area is drawn on the map
        document.getElementById('drawPolygonArea').textContent = 'Get 500 Vessels in Area';
        // enable the vessel info popup to be dragged around on the screen
        makeElementDraggable(document.getElementById('vesselPopup'));
        // close the vessel info popup when the X button is clicked
        document.getElementById('closeVesselPopup').addEventListener('click', function() {
            document.getElementById('vesselPopup').style.display = 'none';
            document.getElementById('vesselInfo').innerHTML = '';
            // un-select the vessel since it's no longer being inspected
            if (window.selectedVessel) {
                window.selectedVessel.setStyle(undefined);
                window.selectedVessel = null;
            }
        });
        // get the weather point forecast for this vessel's last known position
        document.getElementById ('getVesselForecast').onclick = function() {
            var vessel_data = window.selectedVessel.get('data');
            var coordinate = vessel_data['last_known_position']['geometry']['coordinates'];
            // check if forecast feature already exists for this coordinate
            var forecast_feature_id = String(coordinate);
            var forecast_feature = window.forecast_source.getFeatureById(forecast_feature_id);
            if (forecast_feature) {
                displayForecastData(
                    forecast_feature.get(window.MEDIUM_RANGE_FORECAST),
                    forecast_feature_id
                );
            } else {
                var feature_coord = coordinate;
                if (window.CRS == 'EPSG:3857') {
                    // transform the coordinates from standard lat-lon to the projection OpenLayers expects
                    feature_coord = ol.proj.transform(coordinate, 'EPSG:4326', 'EPSG:3857')
                }
                // create the Forecast point feature
                var geometry = new ol.geom.Point(feature_coord);
                var forecastPoint = new ol.Feature({
                    geometry: geometry,
                    // differentiate between normal forecast feature (which we style on the map)
                    // and a vessel forecast feature (which stays invisible,
                    // so it doesn't interfere with the vessel rendering)
                    type: 'vessel_forecast'
                });
                // set an ID for this feature
                // so we can add the forecast data as a property once the API response comes through
                forecastPoint.setId(forecast_feature_id);
                // add the AOI feature to the existing Forecast layer
                window.forecast_source.addFeature( forecastPoint );
                // set cursor to spinning wheel immediately to show that the request has gone through.
                // we will set the cursor back to normal when the forecast API response is received.
                this.style.cursor = 'progress';
                document.body.style.cursor = 'progress';
                // pass the [lon, lat] array in to our function for making a Point Forecast API request
                // and specify 6-hourly forecast for 7 days by default
                getPointForecast(coordinate, window.MEDIUM_RANGE_FORECAST);
            }
        };
    }
});