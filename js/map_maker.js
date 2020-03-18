function vesselStyleFunction(feature) {
    // console.log(feature.getProperties())
    return new ol.style.Style({
        image: new ol.style.Circle({
            radius: 4,
            fill: new ol.style.Fill({
                color: 'rgba(0, 60, 136, 0.3)'
            }),
            stroke: new ol.style.Stroke({
                width: 1,
                color: 'rgba(0, 60, 136, 0.7)'
            })
        })
    });
}

var vesselHoverStyle = new ol.style.Style({
    zIndex: Infinity,
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            // Spire logo red
            color: 'rgba(210, 32, 31, 0.4)'
        }),
        stroke: new ol.style.Stroke({
            width: 2,
            color: 'rgba(210, 32, 31, 0.8)'
        })
    })
});

var vesselSelectStyle = new ol.style.Style({
    zIndex: Infinity,
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        scale: 0.05,
        opacity: 1.0,
        src: 'img/spire_symb_red.png'
    })
});

function boxStyleFunction(feature) {
    // console.log(feature.getProperties())
    return new ol.style.Style({
        stroke: new ol.style.Stroke({
            color: 'rgba(0, 60, 136, 1.0)',
            width: 1
        })
    });
}

function createMapLayer(geojson) {
    // console.log("Create Map Layer for:", geojson)
    var type = geojson['properties']['type'];
    var styleFunction;
    if (type == 'vessels') {
        styleFunction = vesselStyleFunction;
    } else {
        styleFunction = boxStyleFunction;
    }
    var vectorSource = new ol.source.Vector({
        features: (new ol.format.GeoJSON()).readFeatures(geojson)
    });
    var vectorLayer = new ol.layer.Vector({
        className: name,
        source: vectorSource,
        style: styleFunction,
    });
    window.ol_map.addLayer(vectorLayer);
}

function createMap(geojsonObject) {
    // clear the existing map element
    document.getElementById('map').innerHTML = '';

    // track map coordinates at the cursor's current position
    var mousePositionControl = new ol.control.MousePosition({
        coordinateFormat: ol.coordinate.createStringXY(4),
        projection: 'EPSG:4326',
        // comment the following two lines to have the mouse position
        // be placed within the map.
        className: 'custom-mouse-position',
        target: document.getElementById('mouseCoordinates'),
        undefinedHTML: '&nbsp;'
    });

    // create the OpenLayers map and store it in a global variable
    window.ol_map = new ol.Map({
        controls: ol.control.defaults().extend([mousePositionControl]),
        layers: [
            new ol.layer.Tile({
                // free OpenStreetMap tileset
                source: new ol.source.OSM()
            })
        ],
        target: 'map',
        view: new ol.View({
            center: [0, 0],
            zoom: 2
        })
    });

    // 'singleclick'
    // 'click'
    // 'pointermove'
    // 'altclick'
    window.selectedFeature = null;
    window.hoveredFeature = null;

    // click event listener
    window.ol_map.on('click', function(e) {
        if (ENABLE_FORECAST == false) {
            // if (window.selectedFeature !== null) {
            //     window.selectedFeature.setStyle(undefined);
            //     window.selectedFeature = null;
            // }

            window.ol_map.forEachFeatureAtPixel(e.pixel, function(f) {
                if (window.selectedFeature !== null) {
                    // remove selected styling for current selection
                    window.selectedFeature.setStyle(undefined);
                }
                // set new selected feature and style
                window.selectedFeature = f;
                f.setStyle(vesselSelectStyle);
                return true;
            });

            if (window.selectedFeature) {
                if (window.selectedFeature.get('type') == 'vessel') {
                    window.hoveredFeature = null;
                    var vessel_data = window.selectedFeature.get('data');
                    console.log('Selected:', vessel_data);
                    document.getElementById('vesselInfo').innerHTML = '';
                    jsonView.format(vessel_data, '#vesselInfo');
                    document.getElementById('vesselPopup').style.display = 'block';
                }
            }
        }
    });

    // hover event listener
    window.ol_map.on('pointermove', function(e) {
        if (ENABLE_FORECAST == false) {
            if (window.hoveredFeature !== null) {
                window.hoveredFeature.setStyle(undefined);
                window.hoveredFeature = null;
            }

            window.ol_map.forEachFeatureAtPixel(e.pixel, function(f) {
                if (window.selectedFeature != f) {
                    window.hoveredFeature = f;
                    if (window.hoveredFeature.get('type') == 'vessel') {
                        f.setStyle(vesselHoverStyle);
                    }
                }
                return true;
            });
            // if (window.hoveredFeature) {
            //     console.log('Hovering:', window.selectedFeature.get('name'));
            //     console.log(window.selectedFeature);
            //     console.log()
            // }
        }
    });

    // set up the "Download Map Image" button
    var downloadLink = document.getElementById('downloadMap');
    downloadLink.style.visibility = 'visible';
    downloadLink.style.marginBottom = '10px';
    downloadLink.onclick = function() {
        // retrieve all <canvas> elements
        var canvases = document.getElementsByTagName('canvas');
        var mapCanvases = [];
        // get the <canvas> elements created by OpenLayers
        for (var i=0; i<canvases.length; i++) {
            var canvas = canvases[i];
            // filter out the weather forecast graphs
            // which are also rendered on <canvas> elements
            if (canvas.className != 'marks') {
                mapCanvases.push(canvas);
            }
        }
        var layer1 = mapCanvases[0];
        var layer2 = mapCanvases[1];
        // generate one image from combined map and GeoJSON layers
        var imgURI = overlayCanvases(layer1, layer2);
        // create an invisible "link" to initiate the download
        var link = document.createElement('a');
        // specify a name for the image file to be downloaded as
        link.download = 'SpireMap.png';
        link.href = imgURI;
        // add the invisible "link" to the DOM so it can be "clicked"
        document.body.appendChild(link);
        // "click" the invisible link
        link.click();
        // remove the invisible "link" from the DOM
        document.body.removeChild(link);
        // K.O.
        delete link;
    };
}

// combine two <canvas> HTML elements into one image for download:
// one layer is the map
// one layer is the visualized GeoJSON
var overlayCanvases = function(cnv1, cnv2) {
    // https://stackoverflow.com/questions/38851963/how-to-combine-3-canvas-html-elements-into-1-image-file-using-javascript-jquery
    var newCanvas = document.createElement('canvas');
    var ctx = newCanvas.getContext('2d');
    // assumes each canvas has the same dimensions
    var width = cnv1.width;
    var height = cnv1.height;
    newCanvas.width = width;
    newCanvas.height = height;
    // combine the 2 canvases into a third
    [cnv1, cnv2].forEach(function(n) {
        ctx.beginPath();
        if (n != undefined) {
            ctx.drawImage(n, 0, 0, width, height);
        }
    });
    return newCanvas.toDataURL("image/png");
};
