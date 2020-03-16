var ENABLE_FORECAST = false;
var WEATHER_LAT = 0;
var WEATHER_LON = 0;
// get the current URL parameters
var urlParams = new URLSearchParams(window.location.search);

window.addEventListener('load', function() {
    if (urlParams.get('bundles') == 'agricultural') {
        // hide button for getting vessels
        document.getElementById('requestVessels').style.display = 'none';
    }
    document.getElementById('map').onclick = function(evt) {
        if (ENABLE_FORECAST == true) {
            // set cursor to spinning wheel until forecast is retrieved
            document.getElementById('forecast_switch').style.cursor = 'progress';
            document.body.style.cursor = 'progress';
            var coordinate = document.getElementById('mouseCoordinates').textContent;
            coordinate = coordinate.replace(' ','').split(',')
            getPointForecast(coordinate, 'medium_range_std_freq');
        }
    };
    var selectForecast = document.getElementById('requestForecast');
    selectForecast.style.visibility = 'visible';
    selectForecast.style.marginBottom = '10px';
    selectForecast.onclick = function() {
        if (this.className != 'pressed') {
            if (window.drag_box != null) {
                window.ol_map.removeInteraction(window.drag_box);
                document.getElementById('requestVessels').className = '';
            }
            if (urlParams.get('token') != null) {
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
    document.getElementById('closeWeatherStats').onclick = function() {
        closeForecastPopup();
    }
    document.getElementById('grayPageOverlay').onclick = function() {
        closeForecastPopup();
    };
});

function closeForecastPopup() {
    document.getElementById('weatherStats').style.display = 'none';
    document.getElementById('grayPageOverlay').style.display = 'none';
    document.getElementById('day').className = '';
    document.getElementById('week').className = 'selected';
    document.getElementById('forecast_switch').checked = false;
}

function getPointForecast(coordinate, time_bundle) {
    if (coordinate != null) {
        var lat = Number(coordinate[1]);
        var lon = Number(coordinate[0]);
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
        WEATHER_LAT = lat;
        WEATHER_LON = lon;
    }
    document.getElementById('forecast_point_label').innerHTML = 'Latitude: ' + WEATHER_LAT + '<br>Longitude: ' + WEATHER_LON;
    console.log('Getting Weather Point Forecast for:', WEATHER_LAT, WEATHER_LON)
    // build the route for the API call using the `lat` and `lon` URL parameters
    var url = 'https://api.wx.spire.com/forecast/point?lat=' + WEATHER_LAT + '&lon=' + WEATHER_LON;
    url += '&time_bundle=' + time_bundle;
    var BASIC = false;
    var MARITIME = false;
    var AGRICULTURAL = false;
    if (urlParams.get('bundles') == 'agricultural') {
        url += '&bundles=agricultural';
        AGRICULTURAL = true;
        // hide button for getting vessels
        document.getElementById('requestVessels').style.display = 'none';
    } else {
        url += '&bundles=maritime';
        MARITIME = true;
    }

    // for demo purposes, see below
    var WARMEST_WATER = 0;

    fetch(url, {headers:{'spire-api-key':urlParams.get('token')}})
        .then((rawresp) => {
            return rawresp.json();
        })
        .then((response) => {
            console.log('Weather API Response:', response);

            var tempscale = urlParams.get('tempscale');
            if (tempscale == null) {
                tempscale = 'C'
            } else {
                tempscale = tempscale.toUpperCase();
            }

            // initialize arrays to store output data

            // basic
            var air_temp_vals = [];
            var dew_point_temp_vals = [];
            var ne_wind_vals = [];
            var rel_hum_vals = [];
            var air_press_sea_level_vals = [];
            var precip_vals = [];
            var wind_gust_vals = [];
            // maritime
            var sea_surface_temp_vals = [];
            var wave_height_vals = [];
            var northward_sea_velocity_vals = [];
            var eastward_sea_velocity_vals = [];
            // agricultural
            var ag_dew_point_temperature_vals = [];
            var surface_net_downward_shortwave_flux_vals = [];
            var surface_temperature_vals = [];
            var specific_humidity_vals = [];
            var sensible_heat_flux_vals = [];
            var latent_heat_flux_vals = [];
            var surface_net_downward_longwave_flux_vals = [];
            var surface_net_upward_shortwave_flux_vals = [];
            var surface_net_upward_longwave_flux_vals = [];
            var net_upward_longwave_flux_at_top_of_atmosphere_vals = [];
            var soil_temperature_0_10cm_vals = [];
            var soil_moisture_0_10cm_vals = [];
            var soil_temperature_10_40cm_vals = [];
            var soil_moisture_10_40cm_vals = [];
            var soil_temperature_40_100cm_vals = [];
            var soil_moisture_40_100cm_vals = [];
            var soil_temperature_100_200cm_vals = [];
            var soil_moisture_100_200cm_vals = [];

            // iterate through the API response data
            // and build the output data structures
            for (var i = 0; i < response.data.length; i++) {

                var time = response.data[i].times.valid_time;

                if (BASIC) {
                    // add Basic Bundle variables
                    air_temp_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values.air_temperature, tempscale)
                    });
                    dew_point_temp_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values.dew_point_temperature, tempscale)
                    });
                    ne_wind_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_and_combine_velocity_vectors(
                            response.data[i].values.eastward_wind,
                            response.data[i].values.northward_wind
                        ),
                    });
                    rel_hum_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.relative_humidity
                    });
                    air_press_sea_level_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.air_pressure_at_sea_level
                    });
                    wind_gust_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.wind_gust
                    });
                    precip_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_precipitation(response.data, i)
                    });
                }

                if (MARITIME) {
                    // add Maritime Bundle variables

                    // since this is a demo,
                    // keep track of highest number
                    // to ensure at least one graph shows warning and alert colors
                    var sea_temp = parse_temperature(response.data[i].values.sea_surface_temperature, tempscale);
                    if (WARMEST_WATER < sea_temp) {
                        WARMEST_WATER = sea_temp;
                    }

                    sea_surface_temp_vals.push({
                        'Time': get_vega_time(time),
                        'Value': sea_temp
                    });
                    wave_height_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.sea_surface_wave_significant_height
                    });
                    northward_sea_velocity_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.northward_sea_water_velocity
                    });
                    eastward_sea_velocity_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.eastward_sea_water_velocity
                    });
                }

                if (AGRICULTURAL) {
                    // add Agricultural Bundle variables
                    ag_dew_point_temperature_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values.dew_point_temperature, tempscale)
                    });
                    surface_temperature_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values.surface_temperature, tempscale)
                    });
                    specific_humidity_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.specific_humidity
                    });
                    sensible_heat_flux_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.sensible_heat_flux
                    });
                    latent_heat_flux_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.latent_heat_flux
                    });
                    surface_net_downward_shortwave_flux_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.surface_net_downward_shortwave_flux
                    });
                    surface_net_downward_longwave_flux_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.surface_net_downward_longwave_flux
                    });
                    surface_net_upward_shortwave_flux_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.surface_net_upward_shortwave_flux
                    });
                    surface_net_upward_longwave_flux_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.surface_net_upward_longwave_flux
                    });
                    net_upward_longwave_flux_at_top_of_atmosphere_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values.net_upward_longwave_flux_at_top_of_atmosphere
                    });
                    soil_temperature_0_10cm_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values['soil_temperature_0-10cm'], tempscale)
                    });
                    soil_temperature_10_40cm_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values['soil_temperature_10-40cm'], tempscale)
                    });
                    soil_temperature_40_100cm_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values['soil_temperature_40-100cm'], tempscale)
                    });
                    soil_temperature_100_200cm_vals.push({
                        'Time': get_vega_time(time),
                        'Value': parse_temperature(response.data[i].values['soil_temperature_100-200cm'], tempscale)
                    });
                    soil_moisture_0_10cm_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values['soil_moisture_0-10cm']
                    });
                    soil_moisture_10_40cm_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values['soil_moisture_10-40cm']
                    });
                    soil_moisture_40_100cm_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values['soil_moisture_40-100cm']
                    });
                    soil_moisture_100_200cm_vals.push({
                        'Time': get_vega_time(time),
                        'Value': response.data[i].values['soil_moisture_100-200cm']
                    });
                }
            }

            ////////////////////////////////////////////////
            ////////////////////////////////////////////////
            //// Embed the Vega visualizations into the DOM
            ////////////////////////////////////////////////
            ////////////////////////////////////////////////

            if (BASIC) {
                embed_vega_spec(
                    build_vega_spec(
                        'Air Temperature (' + tempscale + ')',
                        { 'values': air_temp_vals },
                        16, // warn threshold value
                        20 // alert threshold value
                    ),
                    '#air_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Dew Point Temperature (' + tempscale + ')',
                        { 'values': dew_point_temp_vals },
                        7, // warn threshold value
                        9 // alert threshold value
                    ),
                    '#dew_point_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Wind Speed (m/s)',
                        { 'values': ne_wind_vals },
                        3, // warn threshold value
                        6 // alert threshold value
                    ),
                    '#ne_wind'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Relative Humidity (%)',
                        { 'values': rel_hum_vals },
                        30, // warn threshold value
                        60 // alert threshold value
                    ),
                    '#rel_hum'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Mean Sea Level Pressure (Pa)',
                        { 'values': air_press_sea_level_vals },
                        104000, // warn threshold value
                        103000 // alert threshold value
                    ),
                    '#air_press_sea_level'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Precipitation (kg/m2)',
                        { 'values': precip_vals },
                        4, // warn threshold value
                        5 // alert threshold value
                    ),
                    '#precip'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Wind Gust (m/s)',
                        { 'values': wind_gust_vals },
                        4, // warn threshold value
                        5 // alert threshold value
                    ),
                    '#wind_gust'
                );
            }

            if (MARITIME) {
                embed_vega_spec(
                    build_vega_spec(
                        'Sea Surface Temperature (' + tempscale + ')',
                        { 'values': sea_surface_temp_vals },
                        WARMEST_WATER - 5, // warn threshold value
                        WARMEST_WATER - 2 // alert threshold value
                    ),
                    '#sea_surface_temp'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Significant Wave Height (m)',
                        { 'values': wave_height_vals },
                        4, // warn threshold value
                        5 // alert threshold value
                    ),
                    '#wave_height'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Northward Ocean Currents (m/s)',
                        { 'values': northward_sea_velocity_vals },
                        0.15, // warn threshold value
                        0.2 // alert threshold value
                    ),
                    '#northward_sea_velocity'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Eastward Ocean Currents (m/s)',
                        { 'values': eastward_sea_velocity_vals },
                        0.15, // warn threshold value
                        0.2 // alert threshold value
                    ),
                    '#eastward_sea_velocity'
                );
            }

            if (AGRICULTURAL) {
                embed_vega_spec(
                    build_vega_spec(
                        'Dew Point Temperature (' + tempscale + ')',
                        { 'values': ag_dew_point_temperature_vals },
                        7, // warn threshold value
                        9 // alert threshold value
                    ),
                    '#ag_dew_point_temperature'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Surface Temperature (' + tempscale + ')',
                        { 'values': surface_temperature_vals },
                        7, // warn threshold value
                        9 // alert threshold value
                    ),
                    '#surface_temperature'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Specific Humidity (kg/kg)',
                        { 'values': specific_humidity_vals },
                        0.01, // warn threshold value
                        0.05 // alert threshold value
                    ),
                    '#specific_humidity'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Sensible Heat Flux (W/m2)',
                        { 'values': sensible_heat_flux_vals },
                        0.5, // warn threshold value
                        1.0 // alert threshold value
                    ),
                    '#sensible_heat_flux'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Latent Heat Flux (W/m2)',
                        { 'values': latent_heat_flux_vals },
                        0.5, // warn threshold value
                        1.0 // alert threshold value
                    ),
                    '#latent_heat_flux'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Suface Net Downward Shortwave Flux (W/m2)',
                        { 'values': surface_net_downward_shortwave_flux_vals },
                        0.5, // warn threshold value
                        1.0 // alert threshold value
                    ),
                    '#surface_net_downward_shortwave_flux'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Surface Net Downward Longwave Flux (W/m2)',
                        { 'values': surface_net_downward_longwave_flux_vals },
                        0.5, // warn threshold value
                        1.0 // alert threshold value
                    ),
                    '#surface_net_downward_longwave_flux'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Surface Net Upward Shortwave Flux (W/m2)',
                        { 'values': surface_net_upward_shortwave_flux_vals },
                        0.5, // warn threshold value
                        1.0 // alert threshold value
                    ),
                    '#surface_net_upward_shortwave_flux'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Surface Net Upward Longwave Flux (W/m2)',
                        { 'values': surface_net_upward_longwave_flux_vals },
                        0.5, // warn threshold value
                        1.0 // alert threshold value
                    ),
                    '#surface_net_upward_longwave_flux'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Net Upward Longwave Flux at Top of Atmosphere (W/m2)',
                        { 'values': net_upward_longwave_flux_at_top_of_atmosphere_vals },
                        0.5, // warn threshold value
                        1.0 // alert threshold value
                    ),
                    '#net_upward_longwave_flux_at_top_of_atmosphere'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Soil Temperature 0-10cm (' + tempscale + ')',
                        { 'values': soil_temperature_0_10cm_vals },
                        7, // warn threshold value
                        9 // alert threshold value
                    ),
                    '#soil_temperature_0_10cm'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Soil Temperature 10-40cm (' + tempscale + ')',
                        { 'values': soil_temperature_10_40cm_vals },
                        7, // warn threshold value
                        9 // alert threshold value
                    ),
                    '#soil_temperature_10_40cm'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Soil Temperature 40-100cm (' + tempscale + ')',
                        { 'values': soil_temperature_40_100cm_vals },
                        7, // warn threshold value
                        9 // alert threshold value
                    ),
                    '#soil_temperature_40_100cm'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Soil Temperature 100-200cm (' + tempscale + ')',
                        { 'values': soil_temperature_100_200cm_vals },
                        7, // warn threshold value
                        9 // alert threshold value
                    ),
                    '#soil_temperature_100_200cm'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Soil Moisture 0-10cm (Fraction)',
                        { 'values': soil_moisture_0_10cm_vals },
                        0.3, // warn threshold value
                        0.5 // alert threshold value
                    ),
                    '#soil_moisture_0_10cm'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Soil Moisture 10-40cm (Fraction)',
                        { 'values': soil_moisture_10_40cm_vals },
                        0.3, // warn threshold value
                        0.5 // alert threshold value
                    ),
                    '#soil_moisture_10_40cm'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Soil Moisture 40-100cm (Fraction)',
                        { 'values': soil_moisture_40_100cm_vals },
                        0.3, // warn threshold value
                        0.5 // alert threshold value
                    ),
                    '#soil_moisture_40_100cm'
                );
                embed_vega_spec(
                    build_vega_spec(
                        'Soil Moisture 100-200cm (Fraction)',
                        { 'values': soil_moisture_100_200cm_vals },
                        0.3, // warn threshold value
                        0.5 // alert threshold value
                    ),
                    '#soil_moisture_100_200cm'
                );
            }
            // reset cursor from spinning wheel to default
            document.getElementById('forecast_switch').style.cursor = 'pointer';
            document.body.style.cursor = 'default';
            // make the forecast popup visible
            document.getElementById('weatherStats').style.display = 'block';
            document.getElementById('grayPageOverlay').style.display = 'block';
            // reset forecast toggle button to not be active
            document.getElementById('requestForecast').className = '';
            // disable forecast-on-map-click
            ENABLE_FORECAST = false;
        });
    // end promise
}