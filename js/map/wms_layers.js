// add the selected WMS layer to the map
// after removing the current one
function addWMSLayer(layer_name, hour='00', style=null) {
	if (window.SpireWMSLayer || layer_name == 'none') {
		// remove existing WMS layer
		window.ol_map.removeLayer(window.SpireWMSLayer);
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
	window.SpireWMSLayer = new ol.layer.Tile({
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
	return window.SpireWMSLayer;
}

function setWMSTime(isostring) {
	// startDate.setMinutes(startDate.getMinutes() + 15);
	// if (startDate > new Date()) {
	//   startDate = threeHoursAgo();
	// }
	window.SpireWMSLayer.getSource().updateParams({'TIME': isostring });
	console.log('Set WMS time to:', isostring);
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
			window.WMSXML[bundle] = {};
			// parse through the returned XML to get the layers broken down by date
			var capabilities = data.getElementsByTagName("Capability")[0];
			var toplayers = capabilities.getElementsByTagName("Layer")[0].getElementsByTagName("Layer")[0];
			// convert HTMLCollection to JS array for easier iteration
			var days = Array.prototype.slice.call( toplayers.children );
			// layers are first ordered by forecast date
			days.forEach(function(day) {
				if (day.tagName == 'Layer') {
					// get the date text in this format: YYYYMMDD
					var dateText = day.getElementsByTagName('Title')[0].textContent;
					// keep track of each available date in our global object
					window.WMSXML[bundle][dateText] = {};
					// convert HTMLCollection to JS array for easier iteration
					var hours = Array.prototype.slice.call( day.children );
					// iterate through the next level of layers (hours)
					hours.forEach(function(hour) {
						if (hour.tagName == 'Layer') {
							// get the hour text: 00, 06, 12, or 18
							var hourText = hour.getElementsByTagName('Title')[0].textContent;
							// keep track of the date's available hours in our global object
							window.WMSXML[bundle][dateText][hourText] = {};
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
									window.WMSXML[bundle][dateText][hourText][name] = {
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
		});
		// end of fetch promise
}
