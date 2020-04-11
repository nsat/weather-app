// add the selected WMS layer to the map
// after removing the current one
function addWMSLayer(layer_name, style, layer_index, times, legend_url) {
	if (window.Current_WMS_Layer[layer_index] || layer_name == 'none') {
		// remove existing WMS layer
		window.ol_map.removeLayer(window.Current_WMS_Layer[layer_index]);
		window.Current_WMS_Layer[layer_index] = null;
		window.WMS_Animation_Times = null;
	}
	if (layer_name != 'none') {
		// set the available times
		window.WMS_Animation_Times = times;
		var max_time_index = times.length - 1;
		document.getElementById('wms_time_slider').max = max_time_index;
		var closest_time = times[0];
		// build the WMS layer configuration
		var layer = buildWMSLayer(layer_name, style, layer_index, closest_time);
		// add the WMS layer to the OpenLayers map
		window.ol_map.addLayer(layer);
		// display the current WMS time
		changeWMSTimeDisplay(closest_time);
		document.getElementById('wms_time_controls').style.display = 'block';
		// make crop button visible
		document.getElementById('cropWMSExtent').style.display = 'block';
		// make legend button visible
		document.getElementById('show_legend_' + layer_index).style.display = 'inline-block';
		// add legend image to popup div
		document.getElementById('legend_wms_' + layer_index).style.backgroundImage = 'url(' + legend_url + ')';
	}
}

// configure a new WMS layer
// for reference: https://openlayers.org/en/latest/examples/wms-time.html
function buildWMSLayer(layer_name, style, layer_index, time) {
	console.log("Building WMS layer:", layer_name, style);
	var bundle = 'basic';
	// check the layer name for the string 'maritime'
	// in which case we will need to specify the bundle
	// in the URL of our API request
	if (layer_name.indexOf('maritime') != -1) {
		bundle = 'maritime';
	}
	// build the URL for the API request
	var url = 'https://api.wx.spire.com/ows/wms/?bundle=' + bundle + '&spire-api-key=' + window.TOKEN;
	// build the parameters object
	var params = {
		'LAYERS': layer_name,
		'STYLES': style,
		'TIME': time
	};
	// configure the WMS layer
	// window.Current_WMS_Layer[layer_index] = new ol.layer.Image({
	var layer = new ol.layer.Tile({
		zIndex: 0,
		opacity: 0.6,
		// source: new ol.source.ImageWMS({
		source: new ol.source.TileWMS({
			url: url,
			params: params,
			serverType: 'mapserver', // 'geoserver'
			//transition: 0 // disable fade-in
		})
	});
	// if there is already an extent set,
	// use it for this new layer as well
	if (window.WMS_Extent) {
		layer.setExtent(window.WMS_Extent);
	}
	// keep track of the current layer in a global variable
	// in order to quickly reference it later
	window.Current_WMS_Layer[layer_index] = layer;
	return layer;
}

function setWMSOpacity(opacity) {
	if (window.Current_WMS_Layer['0']) {
		window.Current_WMS_Layer['0'].setOpacity(opacity);
	}
	if (window.Current_WMS_Layer['1']) {
		window.Current_WMS_Layer['0'].setOpacity(opacity);
	}
}

function setWMSExtent(extent) {
	if (window.CRS == 'EPSG:3857') {
		extent = ol.proj.transformExtent(extent, 'EPSG:4326', 'EPSG:3857');
	}
	window.WMS_Extent = extent;
	if (window.Current_WMS_Layer['0']) {
		window.Current_WMS_Layer['0'].setExtent(extent);
	}
	if (window.Current_WMS_Layer['1']) {
		window.Current_WMS_Layer['1'].setExtent(extent);
	}
}

function setWMSTime(time) {
	if (!time) {
		time = window.WMS_Animation_Current_Time;
	}
	console.log('WMS time being set to:', time);
	changeWMSTimeDisplay(time);
	var time_index = window.WMS_Animation_Times.indexOf(time);
	document.getElementById('wms_time_slider').value = time_index;
	window.WMS_Animation_Time_Index = time_index;
	// Q: is it dangerous to assume the same times exist for both layer?
	// A: yes, definitely.
	if (window.Current_WMS_Layer['0']) {
		window.Current_WMS_Layer['0'].getSource().updateParams({'TIME': time });
	}
	if (window.Current_WMS_Layer['1']) {
		window.Current_WMS_Layer['1'].getSource().updateParams({'TIME': time });
	}
}

function changeWMSTimeDisplay(time) {
	document.getElementById('wms_time_display').innerHTML = time;
	document.getElementById('time_slider_display').innerHTML = time;
}

var stopWMS = function() {
	if (window.WMS_Animation !== null) {
		window.clearInterval(window.WMS_Animation);
		window.WMS_Animation = null;
	}
};

var playWMS = function(index) {
	stopWMS();
	if (index) {
		window.WMS_Animation_Time_Index = index;
	}
	// var frameRate = 0.2; // 1 frame per 5 seconds
	// var frameRate = 0.5; // 1 frame per 2 seconds
	var frameRate = 0.35;
	window.WMS_Animation = window.setInterval(function() {
		var index = window.WMS_Animation_Time_Index;
		var times = window.WMS_Animation_Times;
		window.WMS_Animation_Current_Time = times[index];
		setWMSTime();
		if (index >= times.length - 1) {
			window.WMS_Animation_Time_Index = 0;
		} else {
			window.WMS_Animation_Time_Index = index + 1
		}
	}, 1000 / frameRate);
};

function datestringToEpoch(ds) {
	var year = ds.substring(0, 4);
	var month = ds.substring(4, 6);
	var day = ds.substring(6, 8);
	var datestring = year + '-' + month + '-' + day;
	return new Date(datestring).getTime();
}

// get the full XML response of GetCapabilities
// which describes available layers, styles, and times
function getWMSCapabilities(bundle) {
	console.log('Retrieving ' + bundle + ' WMS Capabilities...');
	var uri = 'https://api.wx.spire.com/ows/wms/?service=WMS&request=GetCapabilities&product=sof-d';
	uri += '&bundle=' + bundle;
	uri += '&spire-api-key=' + window.TOKEN;
	fetch(uri)
		.then(function(response) {
			if (response.status == 401) {
				document.getElementById('grayPageOverlay').style.display = 'block';
                document.getElementById('tokenPopup').style.display = 'block';
                // notify the user that the API response failed
                alert('API request failed for the Weather WMS API.\nPlease enter a valid API key or contact cx@spire.com')
			}
			// return the API response text
			// when it is received
			return response.text();
		})
		.then(function(str) {
			// parse the raw XML text into an XML object
			return (new window.DOMParser()).parseFromString(str, 'text/xml');
		})
		.then(function(data) {
			console.log('Successfully retrieved ' + bundle + ' WMS Capabilities.');
			// keep track of this bundle's relevant capabilities in a global variable
			window.Full_WMS_XML[bundle] = {};
			// parse through the returned XML to get the layers broken down by date
			var capabilities = data.getElementsByTagName("Capability")[0];
			var toplayers = capabilities.getElementsByTagName("Layer")[0].getElementsByTagName("Layer")[0];
			// convert HTMLCollection to JS array for easier iteration
			var days = Array.prototype.slice.call( toplayers.children );
			// keep track of the most recent forecast
			// which we will use as the default
			var latest_date = {
				'text': '',
				'epoch': 0
			}
			// layers are first ordered by forecast date
			days.forEach(function(day) {
				if (day.tagName == 'Layer') {
					// get the date text in this format: YYYYMMDD
					var dateText = day.getElementsByTagName('Title')[0].textContent;
					var epochTime = datestringToEpoch(dateText);
					if (epochTime > latest_date['epoch']) {
						latest_date['text'] = dateText;
						latest_date['epoch'] = epochTime;
					}
					// keep track of each available date in our global object
					window.Full_WMS_XML[bundle][dateText] = {};
					// convert HTMLCollection to JS array for easier iteration
					var hours = Array.prototype.slice.call( day.children );
					// iterate through the next level of layers (hours)
					hours.forEach(function(hour) {
						if (hour.tagName == 'Layer') {
							// get the hour text: 00, 06, 12, or 18
							var hourText = hour.getElementsByTagName('Title')[0].textContent;
							// keep track of the date's available hours in our global object
							window.Full_WMS_XML[bundle][dateText][hourText] = {};
							// convert HTMLCollection to JS array for easier iteration
							var variables = Array.prototype.slice.call( hour.children );
							// iterate through the next level of layers (data variables)
							variables.forEach(function(variable) {
								if (variable.tagName == 'Layer') {
									var name = variable.getElementsByTagName('Name')[0].textContent;
									var displayName = variable.getElementsByTagName('Title')[0].textContent;
									var dimensionFields = variable.getElementsByTagName('Dimension');
									// convert HTMLCollection to JS array for easier iteration
									var dimensions = Array.prototype.slice.call( dimensionFields );
									var times = [];
									// get the time dimension values
									dimensions.forEach(function(dimension) {
										if (dimension.getAttribute('name') == 'time') {
											// convert comma-separated times from text to array
											times = dimension.textContent.split(',');
										}
									});
									var styleOptions = variable.getElementsByTagName('Style');
									// convert HTMLCollection to JS array for easier iteration
									var styles = Array.prototype.slice.call( styleOptions );
									var stylesAndLegends = {};
									// get the name of each style for this variable
									styles.forEach(function(style) {
										var styleName = style.getElementsByTagName('Name')[0].textContent;
										var legend = style.getElementsByTagName('LegendURL')[0];
										var legendURL = legend.getElementsByTagName('OnlineResource')[0].getAttribute('xlink:href');
										stylesAndLegends[styleName] = legendURL + '&spire-api-key=' + window.TOKEN;
									});
									// keep track of the available variables for this hour in our global object
									window.Full_WMS_XML[bundle][dateText][hourText][displayName] = {
										'name': name,
										'title': displayName,
										'styles': stylesAndLegends,
										'times': times,
										'bundle': bundle
									};
								}
							});
						}
					});
				}
			});
			var latest_forecast = window.Full_WMS_XML[bundle][latest_date['text']];
			var issuance_times = Object.keys(latest_forecast);
			var forecast = null;
			// in the following set of conditionals,
			// we get the most recent issuance time of the latest forecast.
			// if there are not 50 or more available forecasted times,
			// data is still being processed,
			// so we move on to find the next complete forecast
			if (issuance_times.indexOf('18') != -1) {
				var latest = latest_forecast['18'];
				// get the array of available times for the first layer
				var times = Object.values(latest)[0]['times'];
				if (times.length >= 50) {
					// use the forecast issued at 18:00
					forecast = latest;
				}
			}
			if (forecast == null && issuance_times.indexOf('12') != -1) {
				var latest = latest_forecast['12'];
				// get the array of available times for the first layer
				var times = Object.values(latest)[0]['times'];
				if (times.length >= 50) {
					// use the forecast issued at 12:00
					forecast = latest;
				}
			}
			if (forecast == null && issuance_times.indexOf('06') != -1) {
				var latest = latest_forecast['06'];
				// get the array of available times for the first layer
				var times = Object.values(latest)[0]['times'];
				if (times.length >= 50) {
					// use the forecast issued at 06:00
					forecast = latest;
				}
			}
			if (forecast == null && issuance_times.indexOf('00') != -1) {
				var latest = latest_forecast['00'];
				// get the array of available times for the first layer
				var times = Object.values(latest)[0]['times'];
				// if (times.length >= 50) {
				// TODO: if there are less than 50 times then this is not a full forecast
				// and it might make sense to grab the last issuance from the previous date
				forecast = latest;
			}
			// add the WMS options to the global window.Latest_WMS object
			// which we will use to build the UI configurator
			var options = Object.keys(forecast);
			options.forEach(function(opt) {
				window.Latest_WMS[opt] = forecast[opt];
			});
			// if we're in the agricultural context,
			// we have only requested the Basic WMS
			if (window.urlParams.get('bundles') == 'agricultural') {
				buildWMSConfigUI();
			} else {
				// check if 2 keys are present (current total bundles supported)
				// 1 for Basic and 1 for Maritime
				if (Object.keys(window.Full_WMS_XML).length == 2) {
					buildWMSConfigUI();
				}
			}
		});
		// end of fetch promise
}

function buildWMSConfigUI() {
	console.log("Building WMS configuration UI.")
	var dropdownA = document.getElementById('wms_layer_select_0');
	var dropdownB = document.getElementById('wms_layer_select_1');
	// clear the dropdowns to get rid of "Loading" message option
	dropdownA.innerHTML = null;
	dropdownB.innerHTML = null;
	// initiate both dropdowns with an option for none
	var null_option = document.createElement('OPTION');
	null_option.value = 'none';
	null_option.textContent = 'None';
	// initiate first dropdown with null option
	dropdownA.appendChild(null_option);
	// copy null option and initiate second dropdown
	dropdownB.appendChild(null_option.cloneNode(true));
	// build the dropdown contents
	var layer_titles = Object.keys(window.Latest_WMS);
	layer_titles.forEach(function(display_name) {
		var option = document.createElement('OPTION');
		option.value = display_name;
		option.textContent = display_name;
		// add option to first dropdown
		dropdownA.appendChild(option);
		// copy option and initiate second dropdown
		dropdownB.appendChild(option.cloneNode(true));
	});
}
