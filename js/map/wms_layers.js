// add the selected WMS layer to the map
// after removing the current one
function addWMSLayer(layer_name, hour='00') {
  if (window.SpireWMSLayer || layer_name == 'none') {
    // remove existing WMS layer
    window.ol_map.removeLayer(window.SpireWMSLayer);
  }
  if (layer_name != 'none') {
    // add selected WMS layer if a valid option was chosen
    window.ol_map.addLayer(buildWMSLayer(layer_name, hour));
  }
}

// configure a new WMS layer
function buildWMSLayer(layer_name, hour) {
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
  // configure the WMS layer
  window.SpireWMSLayer = new ol.layer.Tile({
    // extent: [-13884991, 2870341, -7455066, 6338219],
    zIndex: 0,
    opacity: 0.6, // TODO: allow user to change opacity
    source: new ol.source.TileWMS({
      url: url,
      // crossOrigin: 'anonymous',
      params: {'LAYERS': layer_name},
      serverType: 'mapserver',
      //serverType: 'geoserver', // this works too...
      //transition: 0 // disable fade-in
    })
  });
  return window.SpireWMSLayer;
}

// // get the full XML response of GetCapabilities
// var uri = 'https://api.wx.spire.com/ows/wms/?service=WMS&request=GetCapabilities&product=sof-d';
// uri += '&bundle=basic';
// uri += '&spire-api-key=' + window.TOKEN;
// //fetch(uri, { 'mode': 'cors' })
// // fetch(uri, { 'mode': 'no-cors' })
// fetch(uri)
//   .then(function(response) {
//     console.log(response)
//     return response.text();
//   })
//   .then(function(str) {
//     console.log(str)
//     return (new window.DOMParser()).parseFromString(str, "text/xml");
//   })
//   .then(function(data) {
//     console.log(data);
//   })
