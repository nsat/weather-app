// parse the `short_range_high_freq` and `medium_range_std_freq` data
// out of the `medium_range_high_freq` API response
function get_data_by_time_bundle(data) {
    // get the hourly values for the first day
    var short_range = data.slice(0,25);
    // only get the 6-hourly values
    // for the first 24 hours
    var first_day_6_hourly = [];
    first_day_6_hourly.push(data[0]);
    // if the full forecast is still processing,
    // the API response will not contain all forecast values.
    // therefore, we need to robustly check that the data exists
    // before we try to retrieve it from the array,
    // otherwise we will get errors.
    if (data[6]) {
        first_day_6_hourly.push(data[6]);
        if (data[12]) {
            first_day_6_hourly.push(data[12]);
            if (data[18]) {
                first_day_6_hourly.push(data[18]);
                if (data[24]) {
                    first_day_6_hourly.push(data[24]);
                }
            }
        }
    }
    // get the remaining 6 days worth of 6-hourly values if they exist.
    // this is safe outside of a conditional because
    // JavaScript's slice method will simply return an empty array
    // if the specified array indices are not available
    var last_6_days = data.slice(25,50);
    // concatenate all 6-hourly values
    var medium_range = first_day_6_hourly.concat(last_6_days);
    // return the forecast data separated by time bundles
    return {
        'short_range_high_freq': short_range,
        'medium_range_std_freq': medium_range
    }
}

// change the time format to what the Vega graphs library expects
function get_vega_time(d) {
    var datestring = d.split("T");
    var time = datestring[1].split(",")[0].split("+")[0];
    return datestring[0] + ' ' + time;
}

// temperature scale conversions
function get_temperature(data, tempscale) {
    var temp;
    var temp_kelvin = data;
    if (tempscale == 'F') {
        temp = (temp_kelvin - 273.15) * 9/5 + 32; // Kelvin to Fahrenheit
    } else if (tempscale == 'K') {
        temp = temp_kelvin; // API response is already in Kelvin
    } else {
        temp = temp_kelvin - 273.15; // Kelvin to Celsius
    }
    return temp;
}

// get wind (or ocean currents) speed from U and V velocity components
function get_speed_from_u_v(u, v) {
    return Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2))
}

// get wind (or ocean currents) direction from U and V velocity components
function get_direction_from_u_v(u, v) {
    // Meteorological wind direction
    //   90° corresponds to wind from east,
    //   180° from south
    //   270° from west
    //   360° wind from north.
    //   0° is used for no wind.
    if ((u, v) == (0.0, 0.0)) {
        return 0.0
    } else {
        return (180.0 / Math.PI) * Math.atan2(u, v) + 180.0;
    }
}

// subtract previous data value from current value
// because the response value is accumulated since the start of the forecast
// and we want each bar in the graph to be the value for that time window only
function get_differenced_total_value(data, name, i) {
    var curval;
    if (i != 0) {
        var previous = data[i - 1].values[name];
        curval = data[i].values[name] - previous;
    } else {
        curval = data[i].values[name];
    }
    return curval;
}

// check that both Maritime and Basic data variables exist in the data
// since the forecast update schedule is slightly different
// and it is possible for us to get brand new Basic data returned before Maritime is ready
// in which case we need to fetch the most recent Maritime bundle data explicitly
function maritime_variables_exist(data) {
    if (data[0].values.sea_surface_temperature &&
        data[0].values.sea_surface_wave_significant_height &&
        data[0].values.eastward_sea_water_velocity &&
        data[0].values.northward_sea_water_velocity) {
        // maritime variables exist in the returned data
        // so we are all good to proceed
        return true;
    } else {
        // maritime variables do not exist in the returned data
        // so we must make a new API call explicitly requesting
        // only the maritime bundle
        return false;
    }
}