// change the time format
function get_vega_time(d) {
    var datestring = d.split("T");
    var time = datestring[1].split(",")[0].split("+")[0];
    return datestring[0] + ' ' + time;
}

// temperature scale conversions
function parse_temperature(data, tempscale) {
    var temp;
    var temp_kelvin = data;
    if (tempscale == 'F') {
        temp = (temp_kelvin - 273.15) * 9/5 + 32; // Kelvin to Fahrenheit
    } else if (tempscale == 'K') {
        temp = temp_kelvin; // Kelvin
    } else {
        temp = temp_kelvin - 273.15; // Kelvin to Celsius
    }
    return temp;
}

// combine eastward_wind and northward_wind vector components
function parse_and_combine_velocity_vectors(u, v) {
    var dir = '';
    if (Math.abs(u) < 0.001 && Math.abs(v) < 0.001) {
        dir = 0;
    } else {
        dir = Math.round(Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2)));
        //dir = Math.round(Math.sqrt(Math.pow(u, 2) + Math.pow(v, 2))) + 'mph, direction ' + Math.round(Math.atan2(u, v) * ((180 / Math.PI) + 180));
    }
    return dir;
}

// subtract previous data value from current value
// since raw value is accumulated over all time
// and we want each bar in the graph to be the value for that time window only
function parse_accumulated_value(data, name, i) {
    var curval;
    if (i != 0) {
        var previous = data[i - 1].values[name];
        curval = data[i].values[name] - previous;
    } else {
        curval = data[i].values[name];
    }
    return curval;
}