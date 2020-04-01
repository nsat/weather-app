// add the selected WMS layer to the map
// after removing the current one
function addWMSLayer(layer_name, hour='00', style=null) {
	if (window.CurrentWMSLayer || layer_name == 'none') {
		// remove existing WMS layer
		window.ol_map.removeLayer(window.CurrentWMSLayer);
	}
	if (layer_name != 'none') {
		// build the WMS layer configuration
		var layer = buildWMSLayer(layer_name, hour, style)
		// add the WMS layer to the OpenLayers map
		window.ol_map.addLayer(layer);
	}
}

// configure a new WMS layer
// for reference: https://openlayers.org/en/latest/examples/wms-time.html
function buildWMSLayer(layer_name, hour, style) {
	var bundle = 'basic';
	// check the layer name for the string 'maritime'
	// in which case we will need to specify the bundle
	// in the URL of our API request
	if (layer_name.indexOf('maritime') != -1) {
		bundle = 'maritime';
	}
	// replace the dummy values with real time values
	layer_name = layer_name.replace('YYYYMMDD', window.TODAY);
	layer_name = layer_name.replace('HH', hour);
	// build the URL for the API request
	var url = 'https://api.wx.spire.com/ows/wms/?bundle=' + bundle + '&spire-api-key=' + window.TOKEN;
	// build the parameters object
	var params = {
		'LAYERS': layer_name
	};
	if (style) {
		params['STYLES'] = style;
	}
	// configure the WMS layer
	window.CurrentWMSLayer = new ol.layer.Tile({
		// extent: [-13884991, 2870341, -7455066, 6338219],
		zIndex: 0,
		opacity: 0.6, // TODO: allow user to change opacity
		source: new ol.source.TileWMS({
		url: url,
		params: params,
		serverType: 'mapserver', // 'geoserver'
		//transition: 0 // disable fade-in
		})
	});
	return window.CurrentWMSLayer;
}

function setWMSTime() {
	// startDate.setMinutes(startDate.getMinutes() + 15);
	// if (startDate > new Date()) {
	//   startDate = threeHoursAgo();
	// }
	var time = window.WMS_Animation_Current_Time;
	console.log('WMS time being set to:', time);
	window.CurrentWMSLayer.getSource().updateParams({'TIME': time });
}

var stopWMS = function() {
	if (window.WMS_Animation !== null) {
		window.clearInterval(window.WMS_Animation);
		window.WMS_Animation = null;
	}
};

var playWMS = function() {
	stop();
	var frameRate = 0.3; // frames per second
	// var frameRate = 0.5; // frames per second
	window.WMS_Animation = window.setInterval(function() {
		var index = window.WMS_Animation_Index;
		var times = window.WMS_Animation_Times;
		window.WMS_Animation_Current_Time = times[index];
		setWMSTime();
		if (index >= times.length - 1) {
			window.WMS_Animation_Index = 0;
		} else {
			window.WMS_Animation_Index = index + 1
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
									var styleNames = [];
									// get the name of each style for this variable
									styles.forEach(function(style) {
										var styleName = style.getElementsByTagName('Name')[0].textContent;
										styleNames.push(styleName);
									});
									// keep track of the available variables for this hour in our global object
									window.Full_WMS_XML[bundle][dateText][hourText][displayName] = {
										'name': name,
										'title': displayName,
										'styles': styleNames,
										'times': times
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
			// get the most recent issuance time of the latest forecast
			if (issuance_times.indexOf('18') != -1) {
				// get the forecast issued at 18:00
				forecast = latest_forecast['18'];
			} else if (issuance_times.indexOf('12') != -1) {
				// get the forecast issued at 12:00
				forecast = latest_forecast['12'];
			} else if (issuance_times.indexOf('06') != -1) {
				// get the forecast issued at 06:00
				forecast = latest_forecast['06'];
			} else if (issuance_times.indexOf('00') != -1) {
				// get the forecast issued at 00:00
				forecast = latest_forecast['00'];
			}
			// this is the object we will use to build the UI,
			// thereby showing the available options for the latest forecast
			window.Latest_WMS[bundle] = forecast;
		});
		// end of fetch promise
}
