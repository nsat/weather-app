function displayOptimizedPointData(data, icao, name) {
    /// initialize graphs
    clearAllGraphs();
    // change the display text for the weather graphs popup
    document.getElementById('forecast_point_label').innerHTML = name + ' (' + icao + ')';
    // hide day/week toggle
    document.getElementById('toggle_forecast').style.display = 'block';
    // initialize arrays to store output data:
    var ceiling = [];
    var visibility = [];
    var wind_speed = [];
    var wind_direction = [];
    var air_temperature = [];
    var relative_humidity = [];
    var total_cloud_cover = [];
    var probability_of_fog = [];
    var surface_air_pressure = [];
    var dew_point_temperature = [];
    var eastward_wind_velocity = [];
    var max_temperature_utc_day = [];
    var min_temperature_utc_day = [];
    var northward_wind_velocity = [];
    var precipitation_amount_1hr = [];
    var precipitation_amount_3hr = [];
    var precipitation_amount_6hr = [];
    var max_temperature_local_day = [];
    var min_temperature_local_day = [];
    var probability_of_thunderstorm = [];
    var air_pressure_at_mean_sea_level = [];
    var conditional_probability_of_ice = [];
    var conditional_probability_of_rain = [];
    var conditional_probability_of_snow = [];
    var probability_of_precipitation_1hr = [];
    var probability_of_precipitation_3hr = [];
    var probability_of_precipitation_6hr = [];
    var probability_of_precipitation_24hr = [];

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

        // add Optimized Point variables

        var ceil = data[i].values.ceiling;
        if (ceil != undefined) {
            ceiling.push({
                'Time': valid_time_vega_format,
                'Value': ceil
            });
        }

        var vis = data[i].values.visibility;
        if (vis != undefined) {
            visibility.push({
                'Time': valid_time_vega_format,
                'Value': vis
            });
        }

        var ws = data[i].values.wind_speed;
        if (ws != undefined) {
            wind_speed.push({
                'Time': valid_time_vega_format,
                'Value': ws
            });
        }

        var wd = data[i].values.wind_direction;
        if (wd != undefined) {
            wind_direction.push({
                'Time': valid_time_vega_format,
                'Value': wd
            });
        }

        var air_temp = data[i].values.air_temperature;
        if (air_temp != undefined) {
            air_temperature.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(air_temp, tempscale)
            });
        }

        var rel_hum = data[i].values.relative_humidity;
        if (rel_hum != undefined) {
            relative_humidity.push({
                'Time': valid_time_vega_format,
                'Value': rel_hum
            });
        }

        var tcc = data[i].values.total_cloud_cover;
        if (tcc != undefined) {
            total_cloud_cover.push({
                'Time': valid_time_vega_format,
                'Value': tcc
            });
        }

        var fog = data[i].values.probability_of_fog;
        if (fog != undefined) {
            probability_of_fog.push({
                'Time': valid_time_vega_format,
                'Value': fog
            });
        }

        var sap = data[i].values.surface_air_pressure;
        if (sap != undefined) {
            surface_air_pressure.push({
                'Time': valid_time_vega_format,
                'Value': sap
            });
        }

        var dp_temp = data[i].values.dew_point_temperature;
        if (dp_temp != undefined) {
            dew_point_temperature.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(dp_temp, tempscale)
            });
        }

        var e_wv = data[i].values.eastward_wind_velocity;
        if (e_wv != undefined) {
            eastward_wind_velocity.push({
                'Time': valid_time_vega_format,
                'Value': e_wv
            });
        }

        var n_wv = data[i].values.northward_wind_velocity;
        if (n_wv != undefined) {
            northward_wind_velocity.push({
                'Time': valid_time_vega_format,
                'Value': n_wv
            });
        }

        var max_temp_utc = data[i].values.max_temperature_utc_day;
        if (max_temp_utc != undefined) {
            max_temperature_utc_day.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(max_temp_utc, tempscale)
            });
        }

        var min_temp_utc = data[i].values.min_temperature_utc_day;
        if (min_temp_utc != undefined) {
            min_temperature_utc_day.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(min_temp_utc, tempscale)
            });
        }

        var pa_1 = data[i].values.precipitation_amount_1hr;
        if (pa_1 != undefined) {
            precipitation_amount_1hr.push({
                'Time': valid_time_vega_format,
                'Value': pa_1
            });
        }

        var pa_3 = data[i].values.precipitation_amount_3hr;
        if (pa_3 != undefined) {
            precipitation_amount_3hr.push({
                'Time': valid_time_vega_format,
                'Value': pa_3
            });
        }

        var pa_6 = data[i].values.precipitation_amount_6hr;
        if (pa_6 != undefined) {
            precipitation_amount_6hr.push({
                'Time': valid_time_vega_format,
                'Value': pa_6
            });
        }

        var max_temp_local = data[i].values.max_temperature_local_day;
        if (max_temp_local != undefined) {
            max_temperature_local_day.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(max_temp_local, tempscale)
            });
        }

        var min_temp_local = data[i].values.min_temperature_local_day;
        if (min_temp_local != undefined) {
            min_temperature_local_day.push({
                'Time': valid_time_vega_format,
                'Value': get_temperature(min_temp_local, tempscale)
            });
        }

        var air_press_msl = data[i].values.air_pressure_at_mean_sea_level;
        if (air_press_msl != undefined) {
            air_pressure_at_mean_sea_level.push({
                'Time': valid_time_vega_format,
                'Value': air_press_msl
            });
        }

        var thunder = data[i].values.probability_of_thunderstorm;
        if (thunder != undefined) {
            probability_of_thunderstorm.push({
                'Time': valid_time_vega_format,
                'Value': thunder
            });
        }

        var ice = data[i].values.conditional_probability_of_ice;
        if (ice != undefined) {
            conditional_probability_of_ice.push({
                'Time': valid_time_vega_format,
                'Value': ice
            });
        }

        var rain = data[i].values.conditional_probability_of_rain;
        if (rain != undefined) {
            conditional_probability_of_rain.push({
                'Time': valid_time_vega_format,
                'Value': rain
            });
        }

        var snow = data[i].values.conditional_probability_of_snow;
        if (snow != undefined) {
            conditional_probability_of_snow.push({
                'Time': valid_time_vega_format,
                'Value': snow
            });
        }

        var prob_precip_1 = data[i].values.probability_of_precipitation_1hr;
        if (prob_precip_1 != undefined) {
            probability_of_precipitation_1hr.push({
                'Time': valid_time_vega_format,
                'Value': prob_precip_1
            });
        }

        var prob_precip_3 = data[i].values.probability_of_precipitation_3hr;
        if (prob_precip_3 != undefined) {
            probability_of_precipitation_3hr.push({
                'Time': valid_time_vega_format,
                'Value': prob_precip_3
            });
        }

        var prob_precip_6 = data[i].values.probability_of_precipitation_6hr;
        if (prob_precip_6 != undefined) {
            probability_of_precipitation_6hr.push({
                'Time': valid_time_vega_format,
                'Value': prob_precip_6
            });
        }

        var prob_precip_24 = data[i].values.probability_of_precipitation_24hr;
        if (prob_precip_24 != undefined) {
            probability_of_precipitation_24hr.push({
                'Time': valid_time_vega_format,
                'Value': prob_precip_24
            });
        }

    }

    ////////////////////////////////////////////////
    ////////////////////////////////////////////////
    //// Embed the Vega visualizations into the DOM
    ////////////////////////////////////////////////
    ////////////////////////////////////////////////

    if (ceiling.length > 0) {
        // add the Ceiling table to the DOM
        var table = document.createElement('table');
        var caption = document.createElement('caption');
        caption.innerHTML = 'Cloud Ceiling';
        table.appendChild(caption);
        var headers = document.createElement('tr');
        var time = document.createElement('th');
        var value = document.createElement('th');
        time.innerHTML = 'Time<br>(UTC)';
        value.innerHTML = 'Cloud Ceiling<br>(Range in Meters)';
        headers.appendChild(time);
        headers.appendChild(value);
        table.appendChild(headers);
        for (var i=0; i < ceiling.length; i++) {
            var data = ceiling[i];
            var row = document.createElement('tr');
            var t = document.createElement('td');
            var v = document.createElement('td');
            t.innerHTML = data['Time'];
            t.className = 'table_time';
            v.innerHTML = data['Value'];
            v.className = 'table_value';
            row.appendChild(t);
            row.appendChild(v);
            table.appendChild(row);
        }
        var ceiling_div = document.getElementById('op_ceiling');
        ceiling_div.innerHTML = '';
        ceiling_div.appendChild(table);
        ceiling_div.style.display = 'block';
    }

    if (air_temperature.length > 0 && wind_speed.length > 0) {
        // add the other data variable graphs to the DOM
        embed_vega_spec(
            build_vega_spec(
                'Horizontal Visibility (m)',
                { 'values': visibility },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_visibility'
        );
        embed_vega_spec(
            build_vega_spec(
                'Wind Speed (m/s)',
                { 'values': wind_speed },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_wind_speed'
        );
        embed_vega_spec(
            build_vega_spec(
                'Wind Directon (Degrees)',
                { 'values': wind_direction },
                null, // no alert
                null // no alert
            ),
            '#op_wind_direction'
        );
        embed_vega_spec(
            build_vega_spec(
                'Air Temperature (' + tempscale + ')',
                { 'values': air_temperature },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_air_temp'
        );
        embed_vega_spec(
            build_vega_spec(
                'Relative Humidity (%)',
                { 'values': relative_humidity },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_rel_hum'
        );
        embed_vega_spec(
            build_vega_spec(
                'Total Cloud Cover (%)',
                { 'values': total_cloud_cover },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_cloud_cover'
        );
        embed_vega_spec(
            build_vega_spec(
                'Probability of Fog (%)',
                { 'values': probability_of_fog },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_prob_fog'
        );
        embed_vega_spec(
            build_vega_spec(
                'Surface Air Pressure (Pa)',
                { 'values': surface_air_pressure },
                null, // no alert
                null // no alert
            ),
            '#op_surface_air_press'
        );
        embed_vega_spec(
            build_vega_spec(
                'Dew Point Temperature (' + tempscale + ')',
                { 'values': dew_point_temperature },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_dew_point_temp'
        );
        embed_vega_spec(
            build_vega_spec(
                'Eastward Wind Velocity (m/s)',
                { 'values': eastward_wind_velocity },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_east_wind_vel'
        );
        embed_vega_spec(
            build_vega_spec(
                'Northward Wind Velocity (m/s)',
                { 'values': northward_wind_velocity },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_north_wind_vel'
        );
        embed_vega_spec(
            build_vega_spec(
                '24hr Max. Temperature UTC (' + tempscale + ')',
                { 'values': max_temperature_utc_day },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_max_temp_utc'
        );
        embed_vega_spec(
            build_vega_spec(
                '24hr Min. Temperature UTC (' + tempscale + ')',
                { 'values': min_temperature_utc_day },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_min_temp_utc'
        );
        embed_vega_spec(
            build_vega_spec(
                '1hr Precipitation Amount (mm)',
                { 'values': precipitation_amount_1hr },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_precip_amt_1'
        );
        embed_vega_spec(
            build_vega_spec(
                '3hr Precipitation Amount (mm)',
                { 'values': precipitation_amount_3hr },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_precip_amt_3'
        );
        embed_vega_spec(
            build_vega_spec(
                '6h Precipitation Amount (mm)',
                { 'values': precipitation_amount_6hr },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_precip_amt_6'
        );
        embed_vega_spec(
            build_vega_spec(
                '24hr Max. Temperature Local Time (' + tempscale + ')',
                { 'values': max_temperature_local_day },
                null, // warn threshold value
                null, // alert threshold value
                'Local' // specify timezone
            ),
            '#op_max_temp_local'
        );
        embed_vega_spec(
            build_vega_spec(
                '24hr Min. Temperature Local Time (' + tempscale + ')',
                { 'values': min_temperature_local_day },
                null, // warn threshold value
                null, // alert threshold value
                'Local' // specify timezone
            ),
            '#op_min_temp_local'
        );
        embed_vega_spec(
            build_vega_spec(
                'Air Pressure at Mean Sea Level (Pa)',
                { 'values': air_pressure_at_mean_sea_level },
                null, // no alert
                null // no alert
            ),
            '#op_air_press_sea_level'
        );
        embed_vega_spec(
            build_vega_spec(
                'Probability of Thunderstorm (%)',
                { 'values': probability_of_thunderstorm },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_prob_thunder'
        );
        embed_vega_spec(
            build_vega_spec(
                'Conditional Probability of Ice (%)',
                { 'values': conditional_probability_of_ice },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_prob_ice'
        );
        embed_vega_spec(
            build_vega_spec(
                'Conditional Probability of Rain (%)',
                { 'values': conditional_probability_of_rain },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_prob_rain'
        );
        embed_vega_spec(
            build_vega_spec(
                'Conditional Probability of Snow (%)',
                { 'values': conditional_probability_of_snow },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_prob_snow'
        );
        embed_vega_spec(
            build_vega_spec(
                '1hr Probability of Precipitation (%)',
                { 'values': probability_of_precipitation_1hr },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_prob_precip_1'
        );
        embed_vega_spec(
            build_vega_spec(
                '3hr Probability of Precipitation (%)',
                { 'values': probability_of_precipitation_3hr },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_prob_precip_3'
        );
        embed_vega_spec(
            build_vega_spec(
                '6hr Probability of Precipitation (%)',
                { 'values': probability_of_precipitation_6hr },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_prob_precip_6'
        );
        embed_vega_spec(
            build_vega_spec(
                '24hr Probability of Precipitation (%)',
                { 'values': probability_of_precipitation_24hr },
                null, // warn threshold value
                null // alert threshold value
            ),
            '#op_prob_precip_24'
        );
    }

    // make the forecast popup visible
    document.getElementById('weatherGraphsPopup').style.display = 'block';
    document.getElementById('grayPageOverlay').style.display = 'block';
    // make download button visible
    document.getElementById('download_forecast').style.display = 'block';
}