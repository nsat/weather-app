function getPointForecast(coordinate, time_bundle) {
    // ensure coordinate components are numbers
    // in case they were parsed from an OpenLayers feature ID string
    var lat = Number(coordinate[1]);
    var lon = Number(coordinate[0]);
    // ensure the coordinate is within the range that the API expects
    if (lat < -90) {
        lat = lat + 180;
    } else if (lat > 90) {
        lat = lat - 180;
    }
    if (lon < -180) {
        lon = lon + 360;
    } else if (lon > 180) {
        lon = lon - 360;
    }
    // build the route for the API call using the `lat` and `lon` URL parameters
    var uri = 'https://api.wx.spire.com/forecast/point?lat=' + lat + '&lon=' + lon;
    // always use `medium_range_high_freq` since we can parse other time bundles out of it.
    // that way we can switch between "weekly" `medium_range_std_freq` (6-hourly for 7 days)
    // and "daily" `medium_range_std_freq` (hourly for 24 hours) without multiple API calls
    uri += '&time_bundle=medium_range_high_freq';
    // always show basic bundle graphs
    window.BASIC = true;
    // determine whether to show Maritime or Agricultural graphs
    // based on if the user has specified `bundles=agricultural`
    // as a URL parameter
    window.MARITIME = false;
    window.AGRICULTURAL = false;
    if (window.urlParams.get('bundles') == 'agricultural') {
        // request both agricultural and basic data variables
        uri += '&bundles=agricultural,basic';
        window.AGRICULTURAL = true;
    } else {
        // request both maritime and basic data variables
        uri += '&bundles=maritime,basic';
        window.MARITIME = true;
    }
    // disable forecast-on-map-click now that we are making a request
    window.ENABLE_FORECAST = false;
    // print the full API request to the JS console
    console.log('Spire Weather API: GET', uri);
    // build the HTTP header for Authorization
    var auth_header = {'spire-api-key': window.TOKEN};
    // make the API request with the specified auth header
    fetch(uri, {headers: auth_header})
        .then((rawresp) => {
            // return the API response JSON
            // when it is received
            return rawresp.json();
        })
        .then((response) => {
            // get the forecast feature id the same way we created it earlier
            var forecast_feature_id = String(coordinate)
            // print the API response to the JS console
            console.log('Weather API Response:', response);
            // reset cursor from spinning wheel to default
            document.body.style.cursor = 'default';
            document.getElementById('getVesselForecast').style.cursor = 'pointer';
            document.getElementById('forecast_switch').style.cursor = 'pointer';
            // check if the API returned any errors or faults
            if (response['errors']) {
                // pass OpenLayers forecast feature ID to error handler
                handleErrorResponse(forecast_feature_id);
                // do not proceed with this response handler
                return;
            }
            if (response['fault']) {
                // pass OpenLayers forecast feature ID to fault handler
                handleFaultResponse(forecast_feature_id);
                // do not proceed with this response handler
                return;
            }
            // check that maritime variables exist in the returned data
            if (maritime_variables_exist(response.data) == false) {
                // the latest forecast data must be available for the basic bundle
                // but not yet for the maritime bundle,
                // so we must explicitly request only the maritime bundle
                // to get the latest data returned for those variables
                getMaritimeDataOnly(coordinate, lat, lon, time_bundle);
            }
            // parse the `short_range_high_freq` and `medium_range_std_freq` data
            // out of the `medium_range_high_freq` API response
            var time_bundles_data_object = get_data_by_time_bundle(response.data);
            // get data for the specified time bundle
            var display_data = time_bundles_data_object[time_bundle];
            // show the forecast data in popup graphs
            displayForecastData(display_data, forecast_feature_id);
            // get the OpenLayers feature we already created
            var feature = window.forecast_source.getFeatureById(forecast_feature_id);
            // store the data within the feature using the time_bundle as a key,
            // so we can differentiate between short_range data and medium_range data
            feature.setProperties(time_bundles_data_object);
            // reset forecast toggle button to not be active
            document.getElementById('requestForecast').className = '';
        });
    // end of Promise for fetch
}

// since the forecast update schedule is slightly different for maritime values
// it is possible for us to get brand new Basic data returned before Maritime is ready
// in which case we need to fetch the most recent Maritime bundle data explicitly
// and add it to the Basic data already stored within the OpenLayers forecast feature
function getMaritimeDataOnly(coordinate, lat, lon, time_bundle) {
    var uri = 'https://api.wx.spire.com/forecast/point?lat=' + lat + '&lon=' + lon;
    uri += '&time_bundle=medium_range_high_freq';
    uri += '&bundles=maritime';
    // print the full API request to the JS console
    console.log('Spire Weather API: GET', uri);
    // build the HTTP header for Authorization
    var auth_header = {'spire-api-key': window.TOKEN};
    // make the API request with the specified auth header
    fetch(uri, {headers: auth_header})
        .then((rawresp) => {
            // return the API response JSON
            // when it is received
            return rawresp.json();
        })
        .then((response) => {
            // get the forecast feature id the same way we created it earlier
            var forecast_feature_id = String(coordinate);
            // print the API response to the JS console
            console.log('Weather API Response:', response);
            // check if the API returned any errors or faults
            if (response['errors']) {
                // pass OpenLayers forecast feature ID to error handler
                handleErrorResponse(forecast_feature_id);
                // do not proceed with this response handler
                return;
            }
            if (response['fault']) {
                // pass OpenLayers forecast feature ID to fault handler
                handleFaultResponse(forecast_feature_id);
                // do not proceed with this response handler
                return;
            }
            // parse the `short_range_high_freq` and `medium_range_std_freq` data
            // out of the `medium_range_high_freq` API response
            var time_bundles_data_object = get_data_by_time_bundle(response.data);
            // get data for the specified time bundle
            var display_data = time_bundles_data_object[time_bundle];
            // show the forecast data in popup graphs
            displayForecastData(display_data, forecast_feature_id);
            // get the OpenLayers feature we already created
            var feature = window.forecast_source.getFeatureById(forecast_feature_id);
            // get the current data for this feature so we can add to it
            var cur_mr = feature.get(window.MEDIUM_RANGE_FORECAST);
            var cur_sr = feature.get(window.SHORT_RANGE_FORECAST);
            // prepare the new data we just fetched for concatenation
            var new_mr = time_bundles_data_object[window.MEDIUM_RANGE_FORECAST];
            var new_sr = time_bundles_data_object[window.SHORT_RANGE_FORECAST];
            // combine the data arrays
            var new_feature_data = {
                'medium_range_std_freq': cur_mr.concat(new_mr),
                'short_range_high_freq': cur_sr.concat(new_sr)
            };
            // store the data within the feature using the time_bundle as a key,
            // so we can differentiate between short_range data and medium_range data
            feature.setProperties(new_feature_data);
        });
    // end of fetch promise
}

// handle an API response with 'errors' field
function handleErrorResponse(forecast_feature_id) {
    // assume invalid API key and prompt re-entry
    document.getElementById('grayPageOverlay').style.display = 'block';
    document.getElementById('tokenPopup').style.display = 'block';
    // notify the user that the API response failed
    alert('API request failed for the Weather Point API.\nPlease enter a valid API key or contact cx@spire.com');
    // remove the forecast feature we added since this has failed
    var feature = window.forecast_source.getFeatureById(forecast_feature_id);
    window.forecast_layer.removeFeature(feature);
    // deselect forecast feature
    window.selectedForecast = null;
    // reset forecast toggle button to not be active
    document.getElementById('requestForecast').className = '';
}
// handle an API response with 'fault' field
function handleFaultResponse(forecast_feature_id) {
    // this is likely a rate-limit error...
    // TODO: figure out what to do about that
    // remove the forecast feature we added since this has failed
    var feature = window.forecast_source.getFeatureById(forecast_feature_id);
    window.forecast_source.removeFeature(feature);
    // deselect forecast feature
    window.selectedForecast = null;
    // reset forecast toggle button to not be active
    document.getElementById('requestForecast').className = '';
}