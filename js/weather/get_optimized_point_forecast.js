function getOptimizedPointForecast(icao, time_bundle) {
    // build the route for the API call using the `lat` and `lon` URL parameters
    var uri = 'https://api.wx.spire.com/forecast/point/optimized?location=' + icao;
    // always use `medium_range_high_freq` since we can parse other time bundles out of it.
    // that way we can switch between "weekly" `medium_range_std_freq` (6-hourly for 7 days)
    // and "daily" `medium_range_std_freq` (hourly for 24 hours) without multiple API calls
    uri += '&time_bundle=medium_range_high_freq';
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
            var airport_feature_id = icao;
            // print the API response to the JS console
            console.log('Weather API Response:', response);
            // reset cursor from spinning wheel to default
            document.body.style.cursor = 'default';
            document.getElementById('getVesselForecast').style.cursor = 'pointer';
            document.getElementById('forecast_switch').style.cursor = 'pointer';
            // check if the API returned any errors or faults
            if (response['errors']) {
                // pass OpenLayers airport feature ID to error handler
                handleErrorResponse(airport_feature_id);
                // do not proceed with this response handler
                return;
            }
            if (response['fault']) {
                // pass OpenLayers airport feature ID to fault handler
                handleFaultResponse(airport_feature_id);
                // do not proceed with this response handler
                return;
            }
            // parse the `short_range_high_freq` and `medium_range_std_freq` data
            // out of the `medium_range_high_freq` API response
            var time_bundles_data_object = get_data_by_time_bundle(response.data);
            // get data for the specified time bundle
            var display_data = time_bundles_data_object[time_bundle];
            // show the forecast data in popup graphs
            displayForecastData(display_data, airport_feature_id);
            // get the OpenLayers feature we already created
            var feature = window.airport_source.getFeatureById(airport_feature_id);
            // store the data within the feature using the time_bundle as a key,
            // so we can differentiate between short_range data and medium_range data
            feature.setProperties(time_bundles_data_object);
            // reset forecast toggle button to not be active
            document.getElementById('requestForecast').className = '';
        });
    // end of Promise for fetch
}

// handle an API response with 'errors' field
function handleErrorResponse(airport_feature_id) {
    // assume invalid API key and prompt re-entry
    document.getElementById('grayPageOverlay').style.display = 'block';
    document.getElementById('tokenPopup').style.display = 'block';
    // notify the user that the API response failed
    alert('API request failed for the Weather Point API.\nPlease enter a valid API key or contact cx@spire.com');
    // deselect airport feature
    window.selectedAirport = null;
    // reset forecast toggle button to not be active
    document.getElementById('requestForecast').className = '';
}
// handle an API response with 'fault' field
function handleFaultResponse(airport_feature_id) {
    // this is likely a rate-limit error...
    // TODO: figure out what to do about that
    // deselect forecast feature
    window.selectedAirport = null;
    // reset forecast toggle button to not be active
    document.getElementById('requestForecast').className = '';
}