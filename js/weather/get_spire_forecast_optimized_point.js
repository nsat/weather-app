// check for authentication to the Optimized Point Forecast API;
// show the airport map icons and UI button if auth is good
function test_optimized_point_api() {
    var uri = 'https://api.wx.spire.com/forecast/point/optimized?location=KLAX';
    // print the full API request to the JS console
    console.log('Testing auth to Optimized Point API: GET', uri);
    // build the HTTP header for Authorization
    var auth_header = {'spire-api-key': window.TOKEN};
    // make the API request with the specified auth header
    fetch(uri, {headers: auth_header})
        .then((resp) => {
            if (resp.status != 200) {
                window.optimized_point = false;
            } else {
                window.optimized_point = true;
                // initialize Airports dataset
                addAirportsToMap();
                // initialize Maritime Ports dataset
                addPortsToMap();
                // show button that allows user to hide airport icons
                document.getElementById('toggleAirports').style.display = 'inline-block';
            }
        })
}

// make an Optimized Point Forecast API request
// and generate UI graphs from the response data
function getOptimizedPointForecast(identity, location_type) {
    // build the route for the API call using the `lat` and `lon` URL parameters
    var uri = 'https://api.wx.spire.com/forecast/point/optimized?location=' + location_type + ':' + identity;
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
            // set the feature_id variable for clarity
            var feature_id = identity;
            // print the API response to the JS console
            console.log('Weather API Response:', response);
            // reset cursor from spinning wheel to default
            document.body.style.cursor = 'default';
            document.getElementById('getVesselForecast').style.cursor = 'pointer';
            // check if the API returned any errors or faults
            if (response['errors']) {
                // pass OpenLayers airport feature ID to error handler
                handleErrorResponse(feature_id);
                // do not proceed with this response handler
                return;
            }
            if (response['fault']) {
                // pass OpenLayers airport feature ID to fault handler
                handleFaultResponse(feature_id);
                // do not proceed with this response handler
                return;
            }
            // store the original API response
            window.forecast_data = [
                [identity, response]
            ];
            // get data for the specified time bundle
            var display_data = response.data;
            var feature_name = null;
            if (location_type == 'icao') {
                // get the airport's name from the OpenLayers feature
                feature_name = window.selectedAirport.get('name');
            } else {
                // get the maritime port's name from the OpenLayers feature
                feature_name = window.selectedPort.get('name');
            }
            // show the forecast data in popup graphs
            displayOptimizedPointData(display_data, feature_id, feature_name);
            // reset forecast toggle button to not be active
            document.getElementById('requestForecast').className = '';
        });
    // end of Promise for fetch
}

// handle an API response with 'errors' field
function handleErrorResponse(feature_id) {
    // assume invalid API key and prompt re-entry
    document.getElementById('grayPageOverlay').style.display = 'block';
    document.getElementById('tokenPopup').style.display = 'block';
    // notify the user that the API response failed
    alert('API request failed for the Weather Point API.\nPlease enter a valid API key or contact cx@spire.com');
    // deselect airport/port feature
    window.selectedAirport = null;
    window.selectedPort = null;
    // reset forecast toggle button to not be active
    document.getElementById('requestForecast').className = '';
}
// handle an API response with 'fault' field
function handleFaultResponse(feature_id) {
    // this is likely a rate-limit error...
    // TODO: figure out what to do about that
    // deselect forecast feature
    window.selectedAirport = null;
    window.selectedPort = null;
    // reset forecast toggle button to not be active
    document.getElementById('requestForecast').className = '';
}