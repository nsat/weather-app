function getOptimizedPointForecast(icao) {
    // build the route for the API call using the `lat` and `lon` URL parameters
    var uri = 'https://api.wx.spire.com/forecast/point/optimized?location=' + icao;
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
            // set the airport_feature_id variable for clarity
            var airport_feature_id = icao;
            // print the API response to the JS console
            console.log('Weather API Response:', response);
            // reset cursor from spinning wheel to default
            document.body.style.cursor = 'default';
            document.getElementById('getVesselForecast').style.cursor = 'pointer';
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
            // get data for the specified time bundle
            var display_data = response.data;
            // get the airport's name from the OpenLayers feature
            var airport_name = window.selectedAirport.get('name');
            // show the forecast data in popup graphs
            displayOptimizedPointData(display_data, airport_feature_id, airport_name);
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