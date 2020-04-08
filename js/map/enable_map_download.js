// combine two <canvas> HTML elements into one image for download:
// one canvas is the OpenLayers base map
// one canvas is the GeoJSON map layers with visualized features
var overlayCanvases = function(cnv1, cnv2, cnv3) {
    // https://stackoverflow.com/questions/38851963/how-to-combine-3-canvas-html-elements-into-1-image-file-using-javascript-jquery
    var newCanvas = document.createElement('canvas');
    var ctx = newCanvas.getContext('2d');
    // assumes each canvas has the same dimensions
    var width = cnv1.width;
    var height = cnv1.height;
    newCanvas.width = width;
    newCanvas.height = height;
    // combine the canvases into a single composite
    [cnv1, cnv2, cnv3].forEach(function(n) {
        ctx.beginPath();
        if (n != undefined && n.width != 0 && n.height != 0) {
            ctx.drawImage(n, 0, 0, width, height);
        }
    });
    return newCanvas.toDataURL("image/png");
};

// enable the map and its layers to be downloaded as a single image
// when the download icon button is clicked in the top-right of the app
function enableMapDownload() {
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
        var layer3 = mapCanvases[2];
        // generate one image from combined map and GeoJSON layers
        var imgURI = overlayCanvases(layer1, layer2, layer3);
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