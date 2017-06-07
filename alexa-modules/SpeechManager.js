/*********************************
Parking Manager for Alexa
This module generates complete sentences.
*********************************/

module.exports = {
    generateSpeechForLotType: generateSpeechForLotType,
    generateGeneralSpeech: generateGeneralSpeech,
    generateSpeechForStudentParking: generateSpeechForStudentParking,
    generateSpeechForDetailLotType: generateSpeechForDetailLotType,
    generateSpeechForWeather: generateSpeechForWeather,
    addSpeakTag: addSpeakTag
};

const available_lot_type = ["permit", "motorcycle", "accessible",
	"short term", "visitor", "permit", "meter"];

const SPEECH_ERROR = "Sorry, but something is wrong with my code. Would you mind repeating your question and try again? ";
const SPEECH_BAD_REQ = "Sorry, but the request for API was a failure. Can you make sure that you have the correct access token? ";
const SPEECH_BAD_REQ_TYPE = "Sorry, but I did not recognize the slot type you provided. Would you mind repeating the question for me? ";
const SPEECH_NO_RES_MORE_INFO = "Sorry, but I didn't hear your answer. If you would like to know more information on the lot type you were asking, please say yes. Otherwise, say stop. ";
const SPEECH_NO_PREV_SESSION = "Sorry, I didn't get that. Would you mind starting from the beginning? ";
const SPEECH_WELCOME = "Hello! Welcome to UW Assistant! You can ask me anything about the life events at University of Waterloo. For example, weather, parking. Now, what can I help you with? ";
const SPEECH_LOT_INFO_MISS = "Sorry, but I did not recognize neither the lot type nor the lot name. Would you mind repeating the question again? ";
const SPEECH_LOT_INFO_TWO = "Sorry, but I received both lot type and lot name. However, I can only handle with one input. Would you mind repeating the question? ";
const SPEECH_HELP = ("To ask about weather, say how's the weather on campus? To ask about parking, say, tell me about permit parking. I can handle " + 
	"permit, motorcycle, accessible, short term, visitor, permit, and meter parking. " + 
	"Student parking status is updated real-time. You can ask, how's student parking look like? " +
	"Now, what can I do for you? ");

function generateGeneralSpeech() {
	var dict = {
		SPEECH_ERROR: SPEECH_ERROR,
		SPEECH_BAD_REQ: SPEECH_BAD_REQ,
		SPEECH_BAD_REQ_TYPE: SPEECH_BAD_REQ_TYPE,
		SPEECH_NO_RES_MORE_INFO: SPEECH_NO_RES_MORE_INFO,
		SPEECH_NO_PREV_SESSION: SPEECH_NO_PREV_SESSION,
		SPEECH_WELCOME: SPEECH_WELCOME,
		SPEECH_LOT_INFO_MISS: SPEECH_LOT_INFO_MISS,
		SPEECH_LOT_INFO_TWO: SPEECH_LOT_INFO_TWO,
		SPEECH_HELP: SPEECH_HELP
	};
	return dict;
}

function generateSpeechForStudentParking(data, intent) {
	var speech_out = "";
	var lot_name = ['C', 'N', 'W', 'X'];
	var lot_status = assessStudentParking(data);
	var lot_overall_status = assessStudentOverallParking(lot_status);

	switch (lot_overall_status) {
		case 1:
			speech_out += "Student parking looks normal at the moment. ";
			speech_out += "All slots are either empty or normal. ";
			break;

		case 2:
			speech_out += "Student parking is tense right now. ";
			for (var i = 0; i < 4; i++) {
				speech_out += ("Lot " + lot_name[i] + " ");
				var remaining_spots = (data.data[i].capacity - data.data[i].current_count);
				speech_out += ("has " + remaining_spots + " parking spots left. ");
			}
			break;

		case 3:
			var full_lot = []; var not_full_lot = [];
			for (var j = 0; j < 4; j++) {
				if (lot_status[j] >= 4) { full_lot.push(lot_name[j]); }
				else { not_full_lot.push(lot_name[j]); }
			}
			speech_out += "Lot ";
			for (var k = 0; k < full_lot.length; k++) {
				speech_out += full_lot[k];
				speech_out += ", ";
			}
			if (full_lot.length == 1) {
				speech_out += "is ";
			}
			else { speech_out += "are "; }
			speech_out += "full. However, there are still some parking capacities in lot ";
			for (var l = 0; l < not_full_lot.length; l++) {
				speech_out += not_full_lot[l];
				if (l == (not_full_lot.length - 1)) { speech_out += ". "; }
				else { speech_out += ", "; }
			}
			break;

		case 4:
			speech_out += "All student parking lots are full. ";
			speech_out += "Remaining parking capacity is under 10%. ";
			break;

		default:
			console.log("ERROR: assessStudentOverallParking returned a number other than 1-4! ");
			return "";
	}

	return addSpeakTag(speech_out);
}

function generateSpeechForWeather(data,intent) {
	const weather_data = data.data;
	const cur_temp = weather_data.temperature_current_c;
	const wind_chill = weather_data.windchill_c;
	const high = weather_data.temperature_24hr_max_c;
	const low = weather_data.temperature_24hr_min_c;
	const precip_15m = weather_data.precipitation_15min_mm;
	const precip_1h = weather_data.precipitation_1hr_mm;
	const wind_speed = weather_data.wind_speed_kph;
	const wind_direct = weather_data.wind_direction;

	var speech_out = "";

	// temperature condition
	speech_out += ("Current temperature is " + cur_temp + " degrees. ");
	if (wind_chill !== null) {
		speech_out += ("Wind chill is " + wind_chill + "degrees outside. ");
	}
	speech_out += ("In the next 24 hours, highest will be " + high + " and lowest will be " + low + " degrees. ");

	// rain
	if (precip_15m > 1 && precip_1h > 1) {
		speech_out += ("Rain persists for the next 1 hour. ");
	}
	else if (precip_15m > 1 && precip_1h < 1) {
		speech_out += ("Rain will not in the next 1 hour. ");
	}

	// wind
	if (wind_speed > 10) {
		speech_out += ("Strong wind is blowing outside. ");
	}

	return addSpeakTag(speech_out);
}

function assessStudentOverallParking(result) {
	var total_lot = 4;
	// 4 -> all (almost) full
	// 3 -> some (almost) full, some tense/normal
	// 2 -> tense
	// 1 -> normal
	var full = 0; var tense = 0; var normal = 0;
	for (var i = 0; i < total_lot; i++) {
		if (result[i] >= 4) { full++; }
		else if (result[i] == 3) {
			tense++;
		}
		else if (result[i] <= 2) {
			normal++;
		}
	}
	if (full == total_lot) { return 4; }
	else if (full !== 0) {
		return 3;
	}
	else if (full === 0 && tense >= 3) {
		return 2;
	}
	else { return 1; }
}

function assessStudentParking(data) {
	// assess the condition of four student parking lot
	// return -> [X, X, X, X] for parking status on lot C,N,W,X
	// X -> 1empty, 2normal, 3tense, 4almost full, 5full
	var total_lot = 4; var ret_val = [];
	for (var i = 0; i < total_lot; i++) {
		if (data.data[i].percent_filled < 20) {
			ret_val.push(1);
		}
		else if (data.data[i].percent_filled < 60) {
			ret_val.push(2);
		}
		else if (data.data[i].percent_filled < 80) {
			ret_val.push(3);
		}
		else if (data.data[i].percent_filled < 90) {
			ret_val.push(4);
		}
		else {
			ret_val.push(5);
		}
	}
	return ret_val;
}

function generateSpeechForLotType(data, intent) {
	// user is asking about a lot type
	var total_lot = data.data.length;
	var lot_type = intent.slots.LotType.value;
	if (lot_type === undefined) {
		console.log("ERROR: LotType is empty in generateSpeechForLotType!");
		throw "ERROR";
	}
	var speech_out = "";
	speech_out += ("There are " + total_lot + " " + lot_type + " parking lots. ");
	speech_out += ("Lot " + "<break time=\"0.01s\"/>");
	for (var i = 0; i < total_lot; i++) {
		speech_out += (data.data[i].name + ". ");
		speech_out += "<break time=\"0.3s\"/>";
	}
	speech_out += "You can also refer to the card for detailed information on each lot. ";
	speech_out += "But I can also read you those details, would you like to hear it? ";
	return addSpeakTag(speech_out);
}

function generateSpeechForDetailLotType(session_attr) {
	// user request a detailed information on a parking type
	var speech_out = "";
	var total_lot = session_attr.data.length;
	for (var i = 0; i < total_lot; i++) {
		speech_out += generateSpeechForSingleLot(session_attr.data[i]);
	}
	return addSpeakTag(speech_out);
}

function generateSpeechForSingleLot(lot_data) {
	var speech_out = "";
	speech_out += "Lot " + lot_data.name + ", " + lot_data.description + ". ";
	if (lot_data.additional_info !== undefined) {
		speech_out += lot_data.additional_info + ". ";
	}
	return speech_out;
}

function addSpeakTag(speech) {
	// Remodify the text, so that it satisfies SSML requirement
	var speech_len = speech.length;
	for (var i = 0; i < speech_len; i++) {
		if (speech[i] == '&') {
			speech = speech.substring(0, i) + " and " + speech.substring(i+1, speech_len);
		}
		else if (speech[i] == '/') {

			if (i !== 0 && speech[i-1] == '<') { continue; }
			if (i != (speech_len-1) && speech[i+1] == '>') { continue; }
			speech = speech.substring(0, i) + " or " + speech.substring(i+1, speech_len);
		}
	}
	return ("<speak> " + speech + "</speak>");
}
