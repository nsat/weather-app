// style for Area Of Interest polygon feature
var aoiStyle = new ol.style.Style({
    zIndex: 1,
    stroke: new ol.style.Stroke({
        color: 'rgba(0, 60, 136, 1.0)',
        width: 1
    })
});

// style for a Forecast point feature
var forecastPointStyle = function(feature) {
    var type = feature.get('type');
    if (type == 'forecast') {
        return new ol.style.Style({
            zIndex: Infinity,
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                scale: 0.02,
                opacity: 0.5,
                src: 'img/icon_cloud.png'
            })
        });
    } else if (type == 'vessel_forecast') {
        // features with a type of `vessel_forecast`
        // are kept invisible, so they don't interfere
        // with the vessel's rendering at the same coordinate
        return null;
    }
}

// style for a Forecast point feature that is being hovered on
var forecastHoverStyle = new ol.style.Style({
    zIndex: Infinity,
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        scale: 0.03,
        opacity: 1.0,
        src: 'img/icon_cloud.png'
    })
});

// style for a Airport point feature
var airportPointStyle = function(feature) {
    var type = feature.get('type');
    if (type == 'airport') {
        return new ol.style.Style({
            zIndex: Infinity,
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                scale: 0.05,
                opacity: 0.8,
                src: 'img/airport.png'
            })
        });
    } else if (type == 'vessel_forecast') {
        // features with a type of `vessel_forecast`
        // are kept invisible, so they don't interfere
        // with the vessel's rendering at the same coordinate
        return null;
    }
}

// style for an Airport point feature that is being hovered on
var airportHoverStyle = new ol.style.Style({
    zIndex: Infinity,
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        scale: 0.10,
        opacity: 1.0,
        src: 'img/airport.png'
    })
});

// style for a Maritime Port point feature
var portPointStyle = function(feature) {
    var type = feature.get('type');
    if (type == 'port') {
        return new ol.style.Style({
            zIndex: Infinity,
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                scale: 0.05,
                opacity: 0.8,
                src: 'img/anchor.png'
            })
        });
    } else if (type == 'vessel_forecast') {
        // features with a type of `vessel_forecast`
        // are kept invisible, so they don't interfere
        // with the vessel's rendering at the same coordinate
        return null;
    }
}

// style for a Maritime Port point feature that is being hovered on
var portHoverStyle = new ol.style.Style({
    zIndex: Infinity,
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        scale: 0.10,
        opacity: 1.0,
        src: 'img/anchor.png'
    })
});

// style for a Custom Site point feature
var customPointStyle = function(feature) {
    var type = feature.get('type');
    if (type == 'custom') {
        return new ol.style.Style({
            zIndex: Infinity,
            image: new ol.style.Icon({
                anchor: [0.5, 0.5],
                scale: 0.05,
                opacity: 0.8,
                src: 'img/node.png'
            })
        });
    } else if (type == 'vessel_forecast') {
        // features with a type of `vessel_forecast`
        // are kept invisible, so they don't interfere
        // with the vessel's rendering at the same coordinate
        return null;
    }
}

// style for a Custom Site point feature that is being hovered on
var customHoverStyle = new ol.style.Style({
    zIndex: Infinity,
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        scale: 0.10,
        opacity: 1.0,
        src: 'img/node.png'
    })
});

// style for a Vessel point feature
var vesselStyle = function(feature) {
    return new ol.style.Style({
        zIndex: Infinity - 1,
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            scale: 0.15,
            opacity: 0.4,
            rotation: feature.getProperties()['heading_radians'],
            src: 'img/blue_ship.png'
        })
    });
};

// style for a Vessel point feature that is being hovered on
var vesselHoverStyle = function(feature) {
    return new ol.style.Style({
        zIndex: Infinity,
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            scale: 0.2,
            opacity: 0.7,
            rotation: feature.getProperties()['heading_radians'],
            src: 'img/red_ship.png'
        })
    });
}


// style for a Vessel point feature that has been selected
// and currently has its vessel info displayed in a popup
var vesselSelectStyle = function(feature) {
    return new ol.style.Style({
        zIndex: Infinity,
        image: new ol.style.Icon({
            anchor: [0.5, 0.5],
            scale: 0.2,
            opacity: 1.0,
            rotation: feature.getProperties()['heading_radians'],
            src: 'img/red_ship.png'
        })
    });
}