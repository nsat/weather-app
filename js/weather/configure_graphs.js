function embed_vega_spec(vega_spec, element_id) {
	// https://vega.github.io/vega/docs/config/
	var theme = {
		"background": "#22293d",
		"title": {"color": "#fff"},
		"style": {"guide-label": {"fill": "#fff"}, "guide-title": {"fill": "#fff"}},
		"axis": {"domainColor": "#fff", "gridColor": "#888", "tickColor": "#fff"}
	}
	// embed the Vega visualization to an HTML element
	vegaEmbed(element_id, vega_spec, {config: theme});
}

function build_vega_spec(y_axis_title, data, warn_threshold_val, alert_threshold_val) {
	// TODO: use Vega's "wedge" mark + angle to show wind/currents direction
	// // https://vega.github.io/vega/docs/marks/symbol/
	var tooltip = [
		{"field": "Value","type": "quantitative"},
		{"field": "Time","type": "ordinal","timeUnit": "yearmonthdatehours","title": "Time (UTC)"}
	]
	return {
		"$schema": "https://vega.github.io/schema/vega-lite/v4.json",
		"title": {
			"text": y_axis_title
		},
		"description": "",
		"layer": [
			{
				"data": data,
				"layer": [
					{
						"mark": "bar",
						"encoding": {
							"x": {
								// https://vega.github.io/vega-lite/docs/type.html
								// https://vega.github.io/vega-lite/docs/timeunit.html
								"field": "Time",
								"type": "ordinal",
								"timeUnit": "monthdatehours",
								"axis": {
									"title": "Time  (UTC)",
									"labelAngle": 0
								}
							},
							"y": {
								"field": "Value",
								"type": "quantitative"
							},
							"tooltip": tooltip
						}
					},
				// The following block creates the YELLOW portion of the bar chart
					{
						"mark": "bar",
						"transform": [
							{
								"filter": "datum.Value >= " + String(warn_threshold_val) //"datum.Value >= 60"
							},
							{
								"calculate": String(warn_threshold_val), // "60",
								"as": "warnbaseline"
							}
						],
						"encoding": {
							"x": {
								"field": "Time",
								"type": "ordinal",
								"timeUnit": "monthdatehours"
							},
							"y": {
								"field": "warnbaseline",
								"type": "quantitative"
							},
							"y2": {
								"field": "Value"
							},
							"color": {
								"value": "#fff000" // yellow
							},
							"tooltip": tooltip
						}
					},
				// The following block creates the RED portion of the bar chart
					{
						"mark": "bar",
						"transform": [
							{
								"filter": "datum.Value >= " + String(alert_threshold_val) //"datum.Value >= 60"
							},
							{
								"calculate": String(alert_threshold_val), // "60",
								"as": "baseline"
							}
						],
						"encoding": {
							"x": {
								"field": "Time",
								"type": "ordinal",
								"timeUnit": "monthdatehours"
							},
							"y": {
								"field": "baseline",
								"type": "quantitative"
							},
							"y2": {
								"field": "Value"
							},
							"color": {
								"value": "#e45755" // red
							},
							"tooltip": tooltip
						}
					},
				]
			},
			{
				"data": {
					"values": [
						{
							"ThresholdValue": alert_threshold_val, //60,
							"Threshold": "",// "hazardous",
						},
						{
							"ThresholdValueB": warn_threshold_val, //60,
							"Threshold": "",// "hazardous",
						}
					]
				},
				"layer": [
					{
						"mark": "rule",
						"encoding": {
							"y": {
								"field": "ThresholdValue",
								"type": "quantitative"
							},
							"y2": {
								"field": "ThresholdValueB",
								"type": "quantitative"
							}
						}
					},
					{
						"mark": "rule",
						"encoding": {
							"x": {
								"value": "width"
							},
							"y": {
								"field": "ThresholdValue",
								"type": "quantitative",
								"axis": {
									"title": y_axis_title
								}
							}
						}
					}
				]
			}
		]
	}
// end function
}