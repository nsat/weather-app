// wait to execute all of these functions until the page has loaded,
// ensuring that all HTML elements referenced here have already been created
window.addEventListener('load', function() {

    // initialize the OpenLayers base map
    createMap();

    // set a global variable for easy access of URL parameters.
    // in particular, the weather graphs support different units
    // which can be configured with URL parameters.
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

    // button handler for enabling point forecast on map click
    document.getElementById('requestForecast').onclick = function() {
        // check if button is already pressed
        if (this.className != 'pressed') {
            // disable area selection
            // since it interferes with selecting a point forecast
            if (window.drag_box != null) {
                window.ol_map.removeInteraction(window.drag_box);
                document.getElementById('requestVessels').className = '';
            }
            // change button style to indicate it has been pressed
            this.className = 'pressed';
            // change the cursor to indicate a new mode has been entered
            // where clicking on the map will request a point forecast
            document.body.style.cursor = 'crosshair';
            // enable the forecast flag
            ENABLE_FORECAST = true;
        } else {
            // unpress the button if it's already activated
            this.className = '';
            // reset the cursor to default
            document.body.style.cursor = 'default';
            // disable the forecast flag
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

    // check if the `agricultural` URL parameter has been specified,
    // in which case we will hide the maritime-specific features
    if (window.urlParams.get('bundles') == 'agricultural') {
        // hide button for getting vessels
        document.getElementById('requestVessels').style.display = 'none';
    } else {

        // maritime-specific event handlers:

        // enable the vessel info popup to be dragged around on the screen
        makeElementDraggable(document.getElementById('vesselPopup'));

        document.getElementById('requestVessels').addEventListener('click', function() {
            // create an alias for clicked button element
            // so we can refer to it in other event handlers
            var self = this;
            // un-press the forecast button if it's already activated
            document.getElementById('requestForecast').className = '';
            // disable the global forecast flag / point forecast on map click
            ENABLE_FORECAST = false;
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
                    console.log(drawCoords)
                    // request 500 vessels within this polygon
                    requestVessels(500, drawCoords);
                    // remove the DragBox control from the map
                    window.ol_map.removeInteraction(drawControl);
                    // return the trigger button to it's normal state
                    self.className = '';
                    window.draw_tool = null;
                    document.body.style.cursor = 'default';
                });
                window.draw_tool = drawControl
                window.ol_map.addInteraction(window.draw_tool);
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
    }
});