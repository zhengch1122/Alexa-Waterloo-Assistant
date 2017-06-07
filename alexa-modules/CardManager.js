/********************************
Card Manager for Alexa
This module generates card for displaying.
*********************************/

module.exports = {
	generateCardForStudentParking: generateCardForStudentParking,
	generateCardForLotType: generateCardForLotType,
	generateCardForWeather: generateCardForWeather
};

function generateCardForWeather(data, intent) {
	var card = {};
	card.type = "Standard";
	card.title = "Weather Condition at UW";
	card.text = "";

	const weather_data = data.data;
	const cur_temp = weather_data.temperature_current_c;
	const wind_chill = weather_data.windchill_c;
	const high = weather_data.temperature_24hr_max_c;
	const low = weather_data.temperature_24hr_min_c;
	const precip_15m = weather_data.precipitation_15min_mm;
	const precip_1h = weather_data.precipitation_1hr_mm;
	const wind_speed = weather_data.wind_speed_kph;
	const wind_direct = weather_data.wind_direction;

	// temperatures
	card.text += ("Current Temperature: " + cur_temp + " degress \n");
	if (wind_chill !== null) {
		card.text += ("Wind Chill: " + wind_chill + "degrees \n");
	}
	card.text += ("High/Low in the next 24 hours: " + high + ", " + low + " degrees \n");

	// precip
	if (precip_15m > 1) {
		card.text += ("Precipitation in the next 15 minutes: " + precip_15m + "mm \n");
	}
	if (precip_1h > 1) {
		card.text += ("Precipitation in the next hour: " + precip_1h + "mm \n");
	}
	
	// wind
	card.text += ("Wind: " + wind_speed + "km/h, " + wind_direct + "\n");

	return card;
}

function generateCardForStudentParking(data, intent) {
	var card = {};
	card.type = "Standard";
	card.title = "Student Parking Status";
	card.text = "";
	for (var i = 0; i < 4; ++i) {
		var cap = data.data[i].capacity;
		var count = data.data[i].current_count;
		var percent = data.data[i].percent_filled;
		var lot_name = data.data[i].lot_name;
		card.text += ("Lot " + lot_name + " - ");
		card.text += ("Capacity: " + cap + ", ");
		card.text += ("Occupied spots: " + count + " (" + percent + "%) \n");
	}
	return card;
}

function generateCardForLotType(data, intent) {
	var card = {};
	card.type = "Standard";
	card.title = (intent.slots.LotType.value + " Parking Status");
	card.text = "";
	for (var i = 0; i < 4; ++i) {
		var name = data.data[i].name;
		var desc = data.data[i].description;
		var add_info = data.data[i].additional_info;
		card.text += ("Lot " + name + " - " + desc + " \n");
		if (add_info !== undefined) {
			card.text += ("Additional Information: " + add_info + " \n");
		}
	}
	return card;
}
