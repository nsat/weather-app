// change toggle UI and get new forecast
function toggleChange(evt, elem) {
	if (elem == null) {
		elem = evt.target;
	}
	elem.style.cursor = 'progress';
	document.body.style.cursor = 'progress';
	if (elem.checked) {
		document.getElementById('day').className = 'selected';
		document.getElementById('week').className = '';
		// pass null for `coordinate` to force using the stored coord
		getPointForecast(null, 'short_range_high_freq');
	} else {
		document.getElementById('day').className = '';
		document.getElementById('week').className = 'selected';
		// pass null for `coordinate` to force using the stored coord
		getPointForecast(null, 'medium_range_std_freq');
	}
}

// add event listeners when document is loaded
document.addEventListener('DOMContentLoaded', function() {
	document.getElementById('forecast_switch').addEventListener( 'change', toggleChange, false );
});