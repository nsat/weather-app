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

            var air_temp = data[i].values.air_temperature;
            if (air_temp) {
                air_temp_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_temperature(air_temp, tempscale)
                });
            }
            var dp_temp = data[i].values.dew_point_temperature;
            if (dp_temp) {
                dew_point_temp_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_temperature(dp_temp, tempscale)
                });
            }
            var u = data[i].values.eastward_wind;
            var v = data[i].values.northward_wind;
            if (u && v) {
                wind_speed_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_speed_from_u_v(u, v)
                });
                wind_dir_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_direction_from_u_v(u, v)
                });
            }
            var rel_hum = data[i].values.relative_humidity;
            if (rel_hum) {
                rel_hum_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': rel_hum
                });
            }
            var air_press = data[i].values.air_pressure_at_sea_level;
            if (air_press) {
                air_press_sea_level_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': air_press
                });
            }
            var wind_gust = data[i].values.wind_gust;
            if (wind_gust) {
                wind_gust_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': wind_gust
                });
            }
            var precip = data[i].values.precipitation_amount;
            if (precip) {
                precip_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_differenced_total_value(data, 'precipitation_amount', i)
                });
            }
        }

        if (window.MARITIME) {
            // add Maritime Bundle variables

            var sea_temp = data[i].values.sea_surface_temperature;
            if (sea_temp) {
                sea_surface_temp_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_temperature(sea_temp, tempscale)
                });
            }
            var wave_height = data[i].values.sea_surface_wave_significant_height;
            if (wave_height) {
                wave_height_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': wave_height
                });
            }
            var u = data[i].values.eastward_sea_water_velocity;
            var v = data[i].values.northward_sea_water_velocity;
            if (u && v) {
                ocean_currents_speed_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_speed_from_u_v(u, v)
                });
                ocean_currents_dir_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_direction_from_u_v(u, v)
                });
            }
        }

        if (window.AGRICULTURAL) {
            // add Agricultural Bundle variables

            var dp_temp = data[i].values.dew_point_temperature;
            if (dp_temp) {
                ag_dew_point_temperature_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_temperature(dp_temp, tempscale)
                });
            }

            var sur_temp = data[i].values.surface_temperature;
            if (sur_temp) {
                surface_temperature_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_temperature(sur_temp, tempscale)
                });
            }
            var spec_hum = data[i].values.specific_humidity;
            if (spec_hum) {
                specific_humidity_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': spec_hum
                });
            }
            var sh_flux = data[i].values.sensible_heat_flux;
            if (sh_flux) {
                sensible_heat_flux_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': sh_flux
                });
            }
            var lh_flux = data[i].values.latent_heat_flux;
            if (lh_flux) {
                latent_heat_flux_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': lh_flux
                });
            }
            var ds_flux = data[i].values.surface_net_downward_shortwave_flux;
            if (ds_flux) {
                surface_net_downward_shortwave_flux_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_differenced_total_value(data, 'surface_net_downward_shortwave_flux', i)
                });
            }
            var dl_flux = data[i].values.surface_net_downward_longwave_flux;
            if (dl_flux) {
                surface_net_downward_longwave_flux_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_differenced_total_value(data, 'surface_net_downward_longwave_flux', i)
                });
            }
            var us_flux = data[i].values.surface_net_upward_shortwave_flux;
            if (us_flux) {
                surface_net_upward_shortwave_flux_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_differenced_total_value(data, 'surface_net_upward_shortwave_flux', i)
                });
            }
            var ul_flux = data[i].values.surface_net_upward_longwave_flux;
            if (ul_flux) {
                surface_net_upward_longwave_flux_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_differenced_total_value(data, 'surface_net_upward_longwave_flux', i)
                });
            }
            var ul_flux_atmo = data[i].values.net_upward_longwave_flux_at_top_of_atmosphere;
            if (ul_flux_atmo) {
                net_upward_longwave_flux_at_top_of_atmosphere_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_differenced_total_value(data, 'net_upward_longwave_flux_at_top_of_atmosphere', i)
                });
            }
            var soil_temp_0_10cm = data[i].values['soil_temperature_0-10cm'];
            if (soil_temp_0_10cm) {
                soil_temperature_0_10cm_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_temperature(soil_temp_0_10cm, tempscale)
                });
            }
            var soil_temp_10_40cm = data[i].values['soil_temperature_10-40cm'];
            if (soil_temp_10_40cm) {
                soil_temperature_10_40cm_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_temperature(soil_temp_10_40cm, tempscale)
                });
            }
            var soil_temp_40_100cm = data[i].values['soil_temperature_40-100cm'];
            if (soil_temp_40_100cm) {
                soil_temperature_40_100cm_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_temperature(soil_temp_40_100cm, tempscale)
                });
            }
            var soil_temp_100_200cm = data[i].values['soil_temperature_100-200cm'];
            if (soil_temp_100_200cm) {
                soil_temperature_100_200cm_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': get_temperature(soil_temp_100_200cm, tempscale)
                });
            }
            var soil_moisture_0_10cm = data[i].values['soil_moisture_0-10cm'];
            if (soil_moisture_0_10cm) {
                soil_moisture_0_10cm_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': soil_moisture_0_10cm
                });
            }
            var soil_moisture_10_40cm = data[i].values['soil_moisture_10-40cm'];
            if (soil_moisture_10_40cm) {
                soil_moisture_10_40cm_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': soil_moisture_10_40cm
                });
            }
            var soil_moisture_40_100cm = data[i].values['soil_moisture_40-100cm'];
            if (soil_moisture_40_100cm) {
                soil_moisture_40_100cm_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': soil_moisture_40_100cm
                });
            }
            var soil_moisture_100_200cm = data[i].values['soil_moisture_100-200cm'];
            if (soil_moisture_100_200cm) {
                soil_moisture_100_200cm_vals.push({
                    'Time': valid_time_vega_format,
                    'Value': soil_moisture_100_200cm
                });
            }
        }
    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    //// Embed the Vega visualizations into the DOM
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////

    if (window.BASIC &&
        // check that basic data has actually been returned
        air_temp_vals.length > 0 && wind_speed_vals.length > 0) {
        // add the basic graphs
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
    }

    if (window.AGRICULTURAL &&
        // check that agricultural data has actually been returned
        ag_dew_point_temperature_vals.length > 0 && surface_temperature_vals.length > 0) {
        // add the agricultural graphs
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

    if (window.MARITIME &&
        // check that maritime data has actually been returned
        sea_surface_temp_vals.length > 0 && wave_height_vals.length > 0) {
        // add the maritime graphs
        embed_vega_spec(
            build_vega_spec(
                'Sea Surface Temperature (' + tempscale + ')',
                { 'values': sea_surface_temp_vals },
                null, // no alert
                null // no alert
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
    }

    // make the forecast popup visible
    document.getElementById('weatherGraphsPopup').style.display = 'block';
    document.getElementById('grayPageOverlay').style.display = 'block';
}