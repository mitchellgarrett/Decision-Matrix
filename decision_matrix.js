const ID_MATRIX_TITLE = "MATRIX_TITLE";
const ID_NUM_FEASIBILITY_FACTORS = "NUM_FEASIBILITY_FACTORS";
const ID_NUM_IMPACT_FACTORS = "NUM_IMPACT_FACTORS";
const ID_NUM_OPTIONS = "NUM_OPTIONS";
const ID_MATRIX = "MATRIX";
const ID_FILE_SELECTOR = "FILE_SELECTOR";

const MIN_VALUE = 0;
const MAX_VALUE = 4;

var DATA = {
	"title" : "Decision Matrix",
	"num_feasibility_factors" : "1",
	"num_impact_factors" : "1",
	"num_options" : "1",
	"feasibility_labels" : [ "Factor 1" ],
	"impact_labels" : [ "Factor 1" ],
	"option_labels" : [ "Option 1" ],
	"feasibility_weights" : [ `${MAX_VALUE / 2 - MIN_VALUE}` ],
	"impact_weights" : [ `${MAX_VALUE / 2 - MIN_VALUE}` ],
	"feasibility_values" : [ `${MAX_VALUE / 2 - MIN_VALUE}` ],
	"impact_values" : [ `${MAX_VALUE / 2 - MIN_VALUE}` ]
};

function onDataChanged() {
	// Set title and length variables
	DATA.title = document.getElementById(ID_MATRIX_TITLE).value;
	
	const num_feasibility_factors = parseInt(document.getElementById(ID_NUM_FEASIBILITY_FACTORS).value);
	DATA.num_feasibility_factors = num_feasibility_factors;
	
	const num_impact_factors = parseInt(document.getElementById(ID_NUM_IMPACT_FACTORS).value);
	DATA.num_impact_factors = num_impact_factors;
	
	const num_options = parseInt(document.getElementById(ID_NUM_OPTIONS).value);
	DATA.num_options = num_options;
	
	var element;
	
	DATA.feasibility_labels = [];
	DATA.feasibility_weights = [];
	for (var f = 0; f < num_feasibility_factors; f++) {
		// Set label
		element = document.getElementById(`LABEL_F_${f}`);
		if (element != null) {
			DATA.feasibility_labels[f] = element.value;
		} else {
			DATA.feasibility_labels[f] = `Factor ${(f + 1)}`;
		}
		
		// Set weight
		element = document.getElementById(`WEIGHT_F_${f}`);
		if (element != null) {
			DATA.feasibility_weights[f] = element.value;
		} else {
			DATA.feasibility_weights[f] = MAX_VALUE / 2 - MIN_VALUE;
		}
	}
	
	DATA.impact_labels = [];
	DATA.impact_weights = [];
	for (var i = 0; i < num_impact_factors; i++) {
		// Set label
		element = document.getElementById(`LABEL_I_${i}`);
		if (element != null) {
			DATA.impact_labels[i] = element.value;
		} else {
			DATA.impact_labels[i] = `Factor ${(i + 1)}`;
		}
		
		// Set weight
		element = document.getElementById(`WEIGHT_I_${i}`);
		if (element != null) {
			DATA.impact_weights[i] = element.value;
		} else {
			DATA.impact_weights[i] = MAX_VALUE / 2 - MIN_VALUE;
		}
	}
	
	DATA.option_labels = [];
	DATA.feasibility_values = [];
	DATA.impact_values = [];
	for (var o = 0; o < num_options; o++) {
		// Set label
		element = document.getElementById(`LABEL_O_${o}`);
		if (element != null) {
			DATA.option_labels[o] = element.value;
		} else {
			DATA.option_labels[o] = `Option ${(o + 1)}`;
		}
		
		// Set feasibility values
		DATA.feasibility_values[o] = [];
		for (var f = 0; f < num_feasibility_factors; f++) {
			element = document.getElementById(`VALUE_F_${o}_${f}`);
			if (element != null) {
				DATA.feasibility_values[o][f] = element.value;
			} else {
				DATA.feasibility_values[o][f] = MAX_VALUE / 2 - MIN_VALUE;;
			}
		}
		
		// Set impact values
		DATA.impact_values[o] = [];
		for (var i= 0; i < num_impact_factors; i++) {
			element = document.getElementById(`VALUE_I_${o}_${i}`);
			if (element != null) {
				DATA.impact_values[o][i] = element.value;
			} else {
				DATA.impact_values[o][i] = MAX_VALUE / 2 - MIN_VALUE;;
			}
		}
	}
}

function deleteData(filename) {
	window.localStorage.removeItem(filename);
	location.reload();
}

function saveData() {
	onDataChanged();
	window.localStorage.setItem(`${DATA.title}.json`, JSON.stringify(DATA));
	updateFiles();
}

function updateFiles() {
	var datas = [];
	for (var i = 0; i < window.localStorage.length; i++) {
		var key = window.localStorage.key(i);
		if (key.substr(key.length - 5, 5) == ".json") {
			datas.push(JSON.parse(window.localStorage[key]));
		}
	}
	
	const selector = document.getElementById(ID_FILE_SELECTOR);
	selector.innerHTML = "";
	
	if (datas.length <= 0) {
		var option = document.createElement("option");
		option.innerHTML = "no saved files";
		option.setAttribute("default", null);
		selector.appendChild(option);
	}
	
	for (var i = datas.length - 1; i >= 0; i--) {
		var option = document.createElement("option");
		option.value = datas[i].title + ".json";
		option.innerHTML = datas[i].title;
		
		if (datas[i].title == DATA.title) {
			option.setAttribute("selected", null);
		}
		
		selector.appendChild(option);
	}
}

function loadData(filename) {
	var data = window.localStorage.getItem(filename);
	if (data != null) {
		DATA = JSON.parse(data);
	}
	updateFiles();
	generateMatrix();
}

function downloadData() {
	const blob = new Blob([JSON.stringify(DATA, null, 2)], { type: "text/plain;charset=utf-8" });
	const filename = `${DATA.title}.json`;
	
	const isIE = false || !!document.documentMode;
	if (isIE) {
		window.navigator.msSaveBlob(blob, filename);
	} else {
		var url = window.URL || window.webkitURL;
		var link = url.createObjectURL(blob);
		var a = document.createElement("a");
		a.download = filename;
		a.href = link;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
	}
}

function uploadData() {
	const fr = new FileReader();
	
	fr.onload = function (e) {
		try {
			DATA = JSON.parse(e.target.result);
			generateMatrix();
		} catch (e) {
			location.reload();
		}
	}
	
	var input = document.createElement("input");
	input.type = "file";
	input.accept = ".json";
	input.oninput = () => { fr.readAsText(new Blob([input.files.item(0)], { type: "text/plain;charset=utf-8" })); }
	input.click();
	
	
}

function initializeMatrix() {
	loadData();
}

function calculateMatrix() {
	xs = calculateSubMatrix(DATA.num_feasibility_factors, "F");
	ys = calculateSubMatrix(DATA.num_impact_factors, "I");
	drawGraph(xs, ys);
}

function calculateSubMatrix(factors, id) {
	var options = DATA.num_options;
	
	var total = 0;
	for (var f = 0; f < factors; f++) {
		var weight = parseInt(document.getElementById(`WEIGHT_${id}_${f}`).value);
		total += weight * (MAX_VALUE - MIN_VALUE);
	}
	
	var values = [];
	for (var o = 0; o < options; o++) {
		var sum = 0;
		for (var f = 0; f < factors; f++) {
			var weight = parseInt(document.getElementById(`WEIGHT_${id}_${f}`).value);
			var value = parseInt(document.getElementById(`VALUE_${id}_${o}_${f}`).value);
			sum += weight * (value - MIN_VALUE);
		}
		
		var value = 0;
		if (total > 0) {
			value = sum / total;
		}
		values.push(value);
		document.getElementById(`OUTPUT_${id}_${o}`).value = Math.round(values[values.length - 1] * 100) + "%";
	}
	
	return values;
}

function clampFactors(id, delta) {
	var element;
	if (id == "F") {
		element = document.getElementById(ID_NUM_FEASIBILITY_FACTORS);
	} else if (id == "I") {
		element = document.getElementById(ID_NUM_IMPACT_FACTORS);
	} else if (id == "O") {
		element = document.getElementById(ID_NUM_OPTIONS);
	}
	element.value = parseInt(element.value) + delta;
	if (parseInt(element.value) < parseInt(element.min)) element.value = element.min;
	if (parseInt(element.value) > parseInt(element.max)) element.value = element.max;
}