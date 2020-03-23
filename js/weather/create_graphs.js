function displayForecastData(data, lonlatString) {
    // global variable to track which forecast is displayed
    // to enable shifting from 7day to 24hr forecast
    window.FORECAST_COORDINATE = lonlatString;
    // parse the OpenLayers feature ID string to get the lat/lon coordinates
    var lonlat = lonlatString.split(',');
    // change the latitude and longitude text for the weather graphs popup
    document.getElementById('forecast_point_label').innerHTML = 'Latitude: ' + lonlat[1] + '<br>Longitude: ' + lonlat[0];
    // initialize arrays to store output data:
    // basic
    var air_temp_vals = [];
    var dew_point_temp_vals = [];
    var wind_speed_vals = [];
    var wind_dir_vals = [];
    var rel_hum_vals = [];
    var air_press_sea_level_vals = [];
    var precip_vals = [];
    var wind_gust_vals = [];
    // maritime
    var sea_surface_temp_vals = [];
    var wave_height_vals = [];
    var ocean_currents_speed_vals = [];
    var ocean_currents_dir_vals = [];
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

    // for demo purposes, see below
    var WARMEST_WATER = 0;

    // check URL parameter to set the temperature scale
    var tempscale = window.urlParams.get('tempscale');
    if (tempscale == null) {
        tempscale = 'C'
    } else {
        tempscale = tempscale.toUpperCase();
    }

    // iterate through the API response data
    // and build the output data structures
    for (var i = 0; i < data.length; i++) {

        var valid_time = data[i].times.valid_time;
        var valid_time_vega_format = get_vega_time(valid_time);

        if (window.BASIC) {
            // add Basic Bundle variables
            air_temp_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(data[i].values.air_temperature, tempscale)
            });
            dew_point_temp_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(data[i].values.dew_point_temperature, tempscale)
            });
            wind_speed_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_speed_from_u_v(
                    data[i].values.eastward_wind,
                    data[i].values.northward_wind
                ),
            });
            wind_dir_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_direction_from_u_v(
                    data[i].values.eastward_wind,
                    data[i].values.northward_wind
                ),
            });
            rel_hum_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values.relative_humidity
            });
            air_press_sea_level_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values.air_pressure_at_sea_level
            });
            wind_gust_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values.wind_gust
            });
            precip_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_differenced_total_value(data, 'precipitation_amount', i)
            });
        }

        if (window.MARITIME) {
            // add Maritime Bundle variables

            // since this is a demo,
            // keep track of highest number
            // to ensure at least one graph shows warning and alert colors
            var sea_temp = get_temperature(data[i].values.sea_surface_temperature, tempscale);
            if (WARMEST_WATER < sea_temp) {
                WARMEST_WATER = sea_temp;
            }

            sea_surface_temp_vals.push({
                'Time': valid_time_vega_format,
                'Value': sea_temp
            });
            wave_height_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values.sea_surface_wave_significant_height
            });
            ocean_currents_speed_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_speed_from_u_v(
                    data[i].values.eastward_sea_water_velocity,
                    data[i].values.northward_sea_water_velocity
                ),
            });
            ocean_currents_dir_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_direction_from_u_v(
                    data[i].values.eastward_sea_water_velocity,
                    data[i].values.northward_sea_water_velocity
                ),
            });
        }

        if (window.AGRICULTURAL) {
            // add Agricultural Bundle variables
            ag_dew_point_temperature_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(data[i].values.dew_point_temperature, tempscale)
            });
            surface_temperature_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(data[i].values.surface_temperature, tempscale)
            });
            specific_humidity_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values.specific_humidity
            });
            sensible_heat_flux_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values.sensible_heat_flux
            });
            latent_heat_flux_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values.latent_heat_flux
            });
            surface_net_downward_shortwave_flux_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_differenced_total_value(data, 'surface_net_downward_shortwave_flux', i)
            });
            surface_net_downward_longwave_flux_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_differenced_total_value(data, 'surface_net_downward_longwave_flux', i)
            });
            surface_net_upward_shortwave_flux_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_differenced_total_value(data, 'surface_net_upward_shortwave_flux', i)
            });
            surface_net_upward_longwave_flux_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_differenced_total_value(data, 'surface_net_upward_longwave_flux', i)
            });
            net_upward_longwave_flux_at_top_of_atmosphere_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_differenced_total_value(data, 'net_upward_longwave_flux_at_top_of_atmosphere', i)
            });
            soil_temperature_0_10cm_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(data[i].values['soil_temperature_0-10cm'], tempscale)
            });
            soil_temperature_10_40cm_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(data[i].values['soil_temperature_10-40cm'], tempscale)
            });
            soil_temperature_40_100cm_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(data[i].values['soil_temperature_40-100cm'], tempscale)
            });
            soil_temperature_100_200cm_vals.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(data[i].values['soil_temperature_100-200cm'], tempscale)
            });
            soil_moisture_0_10cm_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values['soil_moisture_0-10cm']
            });
            soil_moisture_10_40cm_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values['soil_moisture_10-40cm']
            });
            soil_moisture_40_100cm_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values['soil_moisture_40-100cm']
            });
            soil_moisture_100_200cm_vals.push({
                'Time': valid_time_vega_format,
                'Value': data[i].values['soil_moisture_100-200cm']
            });
        }
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    //// Embed the Vega visualizations into the DOM
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////

    if (window.BASIC) {
        embed_vega_spec(
            build_vega_spec(
                'Air Temperature (' + tempscale + ')',
                { 'values': air_temp_vals },
                16, // warn threshold value
                20 // alert threshold value
            ),
            '#air_temp'
        );
        if (AGRICULTURAL == false) {
            // Dewpoint Temperature (2 Meters AGL) is used in both Basic and Agricultural bundles
            // so exclude it from the Basic graphs if Agricultural is already specified
            embed_vega_spec(
                build_vega_spec(
                    'Dew Point Temperature (' + tempscale + ')',
                    { 'values': dew_point_temp_vals },
                    7, // warn threshold value
                    9 // alert threshold value
                ),
                '#dew_point_temp'
            );
        } else {
            document.getElementById('dew_point_temp').style.display = 'none';
        }
        embed_vega_spec(
            build_vega_spec(
                'Wind Speed (m/s)',
                { 'values': wind_speed_vals },
                3, // warn threshold value
                6 // alert threshold value
            ),
            '#wind_speed'
        );
        embed_vega_spec(
            build_vega_spec(
                'Wind Directon (Degrees)',
                { 'values': wind_dir_vals },
                null, // no alert
                null // no alert
            ),
            '#wind_direction'
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
                null, // no alert
                null // no alert
            ),
            '#air_press_sea_level'
        );
        embed_vega_spec(
            build_vega_spec(
                'Precipitation (kg/m2)',
                { 'values': precip_vals },
                2, // warn threshold value
                3 // alert threshold value
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

    if (window.MARITIME) {
        if ((!isNaN(sea_surface_temp_vals[0]['Value']) && !isNaN(sea_surface_temp_vals[0]['Value'])) &&
            (!isNaN(wave_height_vals[0]['Value']) && !isNaN(wave_height_vals[0]['Value'])) &&
            (!isNaN(ocean_currents_speed_vals[0]['Value']) && !isNaN(ocean_currents_speed_vals[0]['Value'])) &&
            (!isNaN(ocean_currents_dir_vals[0]['Value']) && !isNaN(ocean_currents_dir_vals[0]['Value']))) {
            document.getElementById('processing_msg').style.display = 'none'
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
                    'Ocean Currents Speed (m/s)',
                    { 'values': ocean_currents_speed_vals },
                    0.15, // warn threshold value
                    0.2 // alert threshold value
                ),
                '#ocean_currents_speed'
            );
            embed_vega_spec(
                build_vega_spec(
                    'Ocean Currents Direction (Degrees)',
                    { 'values': ocean_currents_dir_vals },
                    null, // no alert
                    null // no alert
                ),
                '#ocean_currents_direction'
            );
        } else {
            document.getElementById('processing_msg').style.display = 'block';
        }
    }

    if (window.AGRICULTURAL) {
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
                200, // warn threshold value
                300 // alert threshold value
            ),
            '#sensible_heat_flux'
        );
        embed_vega_spec(
            build_vega_spec(
                'Latent Heat Flux (W/m2)',
                { 'values': latent_heat_flux_vals },
                150, // warn threshold value
                200 // alert threshold value
            ),
            '#latent_heat_flux'
        );
        embed_vega_spec(
            build_vega_spec(
                'Suface Net Downward Shortwave Flux (W/m2)',
                { 'values': surface_net_downward_shortwave_flux_vals },
                8000000, // warn threshold value
                10000000 // alert threshold value
            ),
            '#surface_net_downward_shortwave_flux'
        );
        embed_vega_spec(
            build_vega_spec(
                'Surface Net Downward Longwave Flux (W/m2)',
                { 'values': surface_net_downward_longwave_flux_vals },
                8000000, // warn threshold value
                10000000 // alert threshold value
            ),
            '#surface_net_downward_longwave_flux'
        );
        embed_vega_spec(
            build_vega_spec(
                'Surface Net Upward Shortwave Flux (W/m2)',
                { 'values': surface_net_upward_shortwave_flux_vals },
                8000000, // warn threshold value
                10000000 // alert threshold value
            ),
            '#surface_net_upward_shortwave_flux'
        );
        embed_vega_spec(
            build_vega_spec(
                'Surface Net Upward Longwave Flux (W/m2)',
                { 'values': surface_net_upward_longwave_flux_vals },
                8000000, // warn threshold value
                10000000 // alert threshold value
            ),
            '#surface_net_upward_longwave_flux'
        );
        embed_vega_spec(
            build_vega_spec(
                'Net Upward Longwave Flux at Top of Atmosphere (W/m2)',
                { 'values': net_upward_longwave_flux_at_top_of_atmosphere_vals },
                8000000, // warn threshold value
                10000000 // alert threshold value
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
                0.5, // warn threshold value
                0.8 // alert threshold value
            ),
            '#soil_moisture_0_10cm'
        );
        embed_vega_spec(
            build_vega_spec(
                'Soil Moisture 10-40cm (Fraction)',
                { 'values': soil_moisture_10_40cm_vals },
                0.5, // warn threshold value
                0.8 // alert threshold value
            ),
            '#soil_moisture_10_40cm'
        );
        embed_vega_spec(
            build_vega_spec(
                'Soil Moisture 40-100cm (Fraction)',
                { 'values': soil_moisture_40_100cm_vals },
                0.5, // warn threshold value
                0.8 // alert threshold value
            ),
            '#soil_moisture_40_100cm'
        );
        embed_vega_spec(
            build_vega_spec(
                'Soil Moisture 100-200cm (Fraction)',
                { 'values': soil_moisture_100_200cm_vals },
                0.5, // warn threshold value
                0.8 // alert threshold value
            ),
            '#soil_moisture_100_200cm'
        );
    }

    // make the forecast popup visible
    document.getElementById('weatherStats').style.display = 'block';
    document.getElementById('grayPageOverlay').style.display = 'block';
}