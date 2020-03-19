window.addEventListener('load', function() {
    // initialize the OpenLayers base map
    createMap();
    // set a global variable for easy access of URL parameters.
    // in particular, the weather graphs support different units
    // which can be configured with URL parameters.
    window.urlParams = new URLSearchParams(window.location.search);
    // check if the `agricultural` URL parameter has been specified,
    // in which case we will disable all maritime-specific features
    if (window.urlParams.get('bundles') == 'agricultural') {
        // hide button for getting vessels
        document.getElementById('requestVessels').style.display = 'none';
    } else {
        // enable the vessel info popup to be dragged around on the screen
        makeElementDraggable(document.getElementById('vesselPopup'));
    }
    // handler for token popup form submission
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
        }
    });
    // handler for token user input change
    document.getElementById('token').addEventListener('change', function(evt) {
        // as long as there is a real value in the input field when the DOM element loses focus,
        // we handle the value change as if it were an explicit form submission.
        // this has the side effect of submitting the autofilled form on any mouse or key event after page load.
        if (this.value != null) {
            window.TOKEN = this.value;
            document.getElementById('tokenPopup').style.display = 'none';
            document.getElementById('grayPageOverlay').style.display = 'none';
        }
    });
    document.getElementById('requestVessels').addEventListener('click', function() {
        var self = this;
        // unpress the button if it's already activated
        document.getElementById('requestForecast').className = '';
        document.body.style.cursor = 'default';
        ENABLE_FORECAST = false;
        if (self.className != 'pressed') {
            if (window.TOKEN == null) {
                alert('Please include your Spire API token as a URL parameter:\n "?token=YOURTOKEN"');
                return;
            }
            self.className = 'pressed';
            document.body.style.cursor = 'crosshair';
            boxControl = new ol.interaction.DragBox({className: 'dragbox'});
            boxControl.on('boxend', function () {
                document.body.style.cursor = 'progress';
                // get coordinates of user-drawn box
                var boxCoords = boxControl.getGeometry().getCoordinates()[0];
                // request 500 vessels within this polygon
                requestVessels(500, boxCoords);
                // remove the DragBox control from the map
                window.ol_map.removeInteraction(boxControl);
                // return the trigger button to it's normal state
                self.className = '';
                window.drag_box = null;
            });
            window.ol_map.addInteraction(boxControl);
            window.drag_box = boxControl;
        } else {
            window.ol_map.removeInteraction(window.drag_box);
            self.className = '';
        }
    });
    document.getElementById('closeVesselPopup').addEventListener('click', function() {
        document.getElementById('vesselPopup').style.display = 'none';
        document.getElementById('vesselInfo').innerHTML = '';
        if (window.selectedFeature) {
            window.selectedFeature.setStyle(undefined);
            window.selectedFeature = null;
        }
    });
    document.getElementById ('getVesselForecast').onclick = function() {
        var vessel_data = window.selectedFeature.get('data');
        var coordinate = vessel_data['last_known_position']['geometry']['coordinates'];
        this.style.cursor = 'progress';
        document.body.style.cursor = 'progress';
        getPointForecast(coordinate, 'medium_range_std_freq');
    }
    var selectForecast = document.getElementById('requestForecast');
    selectForecast.style.visibility = 'visible';
    selectForecast.style.marginBottom = '10px';
    selectForecast.onclick = function() {
        if (this.className != 'pressed') {
            if (window.drag_box != null) {
                window.ol_map.removeInteraction(window.drag_box);
                document.getElementById('requestVessels').className = '';
            }
            if (window.TOKEN != null) {
                // enable clicking on map to request forequest
                // and change the cursor to indicate new mode has been entered
                this.className = 'pressed';
                document.body.style.cursor = 'crosshair';
                ENABLE_FORECAST = true;
            } else {
                alert('Please include your Spire API token as a URL parameter:\n "?token=YOURTOKEN"');
            }
        } else {
            // unpress the button if it's already activated
            this.className = '';
            document.body.style.cursor = 'default';
            ENABLE_FORECAST = false;
        }
    };
    // map click handler applied when a user is selecting a point for weather forecast
    document.getElementById('map').onclick = function(evt) {
        // check that user is selecting a point for weather forecast
        if (ENABLE_FORECAST == true) {
            // set cursor to spinning wheel immediately to show that the request has gone through.
            // we will set the cursor back to normal when the forecast API response is received.
            document.body.style.cursor = 'progress';
            document.getElementById('forecast_switch').style.cursor = 'progress';
            // we are already auto-storing the latitude/longitude coordinates of the current mouse position
            // so we can simply grab the content of the DOM element displaying those coordinates
            var coordinate = document.getElementById('mouseCoordinates').textContent;
            // parse the coordinate string by removing whitespace and splitting into an array with lat and lon
            coordinate = coordinate.replace(' ','').split(',')
            // pass the [lon, lat] array in to our function for making a Point Forecast API request
            // and specify 6-hourly forecast for 7 days by default
            getPointForecast(coordinate, 'medium_range_std_freq');
        }
    };
    // function for closing the Weather Point Forecast graphs popup...
    function closeForecastPopup() {
        // hide the weather graphs popup
        document.getElementById('weatherStats').style.display = 'none';
        // hide the gray page overlay
        document.getElementById('grayPageOverlay').style.display = 'none';
        // reset the day/week toggle switch so it's initiated properly for the next forecast
        document.getElementById('day').className = '';
        document.getElementById('week').className = 'selected';
        document.getElementById('forecast_switch').checked = false;
    }
    // ...when the user clicks on the X button of the weather graphs popup...
    document.getElementById('closeWeatherStats').onclick = function() {
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
});