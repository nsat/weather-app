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
                opacity: 1.0,
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

// style for a Vessel point feature
var vesselStyle = new ol.style.Style({
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

// style for a Vessel point feature that is being hovered on
var vesselHoverStyle = new ol.style.Style({
    zIndex: Infinity,
    image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
            // red from Spire logo
            color: 'rgba(210, 32, 31, 0.4)'
        }),
        stroke: new ol.style.Stroke({
            width: 2,
            color: 'rgba(210, 32, 31, 0.8)'
        })
    })
});

// style for a Vessel point feature that has been selected
// and currently has its vessel info displayed in a popup
var vesselSelectStyle = new ol.style.Style({
    zIndex: Infinity,
    image: new ol.style.Icon({
        anchor: [0.5, 0.5],
        scale: 0.05,
        opacity: 1.0,
        src: 'img/spire_symb_red.png'
        // src: 'img/spire_symb_maritime.png'
        // src: 'img/icon_ship.png'
    })
});