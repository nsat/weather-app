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
        uri += '&bundles=agricultural,basic';
        window.AGRICULTURAL = true;
    } else {
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
            // print the API response to the JS console
            console.log('Weather API Response:', response);
            // reset cursor from spinning wheel to default
            document.body.style.cursor = 'default';
            document.getElementById('getVesselForecast').style.cursor = 'pointer';
            document.getElementById('forecast_switch').style.cursor = 'pointer';
            // check if the API returned any errors
            if (response['errors']) {
                // assume invalid API key and prompt re-entry
                document.getElementById('grayPageOverlay').style.display = 'block';
                document.getElementById('tokenPopup').style.display = 'block';
                // notify the user that the API response failed
                alert('API response failed.\nPlease enter a valid API key.')
            }
            // get the forecast feature id the same way we created it earlier
            var forecast_feature_id = String(coordinate);
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