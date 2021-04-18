const ID_MATRIX_TITLE = "MATRIX_TITLE";
const ID_NUM_FEASIBILITY_FACTORS = "NUM_FEASIBILITY_FACTORS";
const ID_NUM_IMPACT_FACTORS = "NUM_IMPACT_FACTORS";
const ID_NUM_OPTIONS = "NUM_OPTIONS";
const ID_FEASIBILITY_MATRIX = "FEASIBILITY_MATRIX";
const ID_IMPACT_MATRIX = "IMPACT_MATRIX";
const ID_GRAPH = "GRAPH";
const ID_DATA = "MATRIX_DATA";

const COLORS = [ "red", "yellow", "green" ];
const LABELS = [ "None", "Below Average", "Average", "Above Average", "Most" ];
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

function clearData() {
	window.localStorage.removeItem(ID_DATA);
	location.reload();
}

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

function saveData() {
	onDataChanged();
	window.localStorage.setItem(ID_DATA, JSON.stringify(DATA));
}

function loadData() {
	var data = window.localStorage.getItem(ID_DATA);
	if (data != null) {
		DATA = JSON.parse(data);
	}
	
	generateMatrix();
}

function initializeMatrix() {
	loadData();
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

function drawGraph(xs, ys) {
	const canvas = document.getElementById(ID_GRAPH);
	const ctx = canvas.getContext("2d");
	
	canvas.width = window.innerWidth * 0.5;
	canvas.height = canvas.width * 0.5;
	
	const BORDER = 12.5;
	const MIN_X = BORDER;
	const MAX_X = canvas.width - BORDER;
	const MIN_Y = BORDER;
	const MAX_Y = canvas.height - BORDER;
	const WIDTH = MAX_X - MIN_X;
	const HEIGHT = MAX_Y - MIN_Y;
	
	ctx.clearRect(0, 0, canvas.width,  canvas.height);
	
	// Draw border
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(MIN_X, MIN_Y + HEIGHT / 2);
	ctx.lineTo(MAX_X, MIN_Y + HEIGHT / 2);
	ctx.moveTo(MIN_X + WIDTH / 2, MIN_Y);
	ctx.lineTo(MIN_X + WIDTH / 2, MAX_Y);
	ctx.rect(MIN_X, MIN_Y, WIDTH, HEIGHT);
	ctx.stroke();
	
	// Draw text
	ctx.font = `bold ${BORDER}px Courier New`;
	ctx.textAlign = "center";
	ctx.save();
	ctx.textBaseline = "hanging";
	ctx.fillText("Feasibility Factors", MIN_X + WIDTH / 2, MAX_Y);
	ctx.translate(0, MIN_Y + HEIGHT / 2);
	ctx.rotate(-Math.PI / 2);
	ctx.fillText("Impact Factors", 0, 0);
	ctx.restore();
	
	// Draw points
	for (var i = 0; i < xs.length; i++) {
		if (xs[i] >= 0.5 && ys[i] >= 0.5) {
			if (xs[i] > 0.5 || ys[i] > 0.5) {
				ctx.fillStyle = COLORS[2];
			} else {
				ctx.fillStyle = COLORS[1];
			}
		} else {
			ctx.fillStyle = COLORS[0];
		}
		
		ctx.beginPath();
		ctx.arc(MIN_X + xs[i] * WIDTH, MAX_Y - ys[i] * HEIGHT, 15, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "black";
		ctx.textBaseline = "middle";
		ctx.fillText((i + 1), MIN_X + xs[i] * WIDTH, MAX_Y - ys[i] * HEIGHT);
	}
}

function calculateMatrix() {
	xs = calculateSubMatrix(DATA.num_feasibility_factors, "F");
	ys = calculateSubMatrix(DATA.num_impact_factors, "I");
	drawGraph(xs, ys);
}

function generateSubMatrix(matrixType, factors, title, id) {
	var options = DATA.num_options;
	
	var matrix = document.getElementById(matrixType);
	matrix.innerHTML = "";
	
	var tr;
	var th;
	
	// Create header
	tr = document.createElement("tr");
	matrix.appendChild(tr);
	
	th = document.createElement("th");
	th.innerHTML = `<b>${title}</b>`;
	tr.appendChild(th);
	
	th = document.createElement("th");
	th.innerHTML = "<b>Importance</b>";
	tr.appendChild(th);
	
	// Columns
	for (var o = 0; o < options; o++) {
		th = document.createElement("th");
		th.innerHTML = `<input id="LABEL_O_${o}" type="text" value="${DATA.option_labels[o]}" oninput="onDataChanged();">`;
		tr.appendChild(th);
	}
	
	/*tr = document.createElement("tr");
	matrix.appendChild(tr);
	
	th = document.createElement("th");
	th.setAttribute("colspan", 2 + options); 
	th.innerHTML = `<b>${title}</b>`;
	tr.appendChild(th);*/
	
	// Rows
	for (var f = 0; f < factors; f++) {
		matrix.appendChild(generateRow(f, options, id));
	}
	
	// Outputs
	tr = document.createElement("tr");
	matrix.appendChild(tr);
	
	th = document.createElement("th");
	tr.appendChild(th);
		
	th = document.createElement("th");
	th.innerHTML = "<b>Totals</b>"
	tr.appendChild(th);
	
	for (var o = 0; o < options; o++) {
		th = document.createElement("th");
		th.innerHTML = `<output id="OUTPUT_${id}_${o}"><b>0</b></output>`;
		tr.appendChild(th);
	}
	
}

function generateMatrix() {
	//saveData(DATA);
	document.getElementById(ID_MATRIX_TITLE).value = DATA.title;
	document.getElementById(ID_NUM_FEASIBILITY_FACTORS).value = DATA.num_feasibility_factors;
	document.getElementById(ID_NUM_IMPACT_FACTORS).value = DATA.num_impact_factors;
	document.getElementById(ID_NUM_OPTIONS).value = DATA.num_options;
	
	generateSubMatrix(ID_FEASIBILITY_MATRIX, DATA.num_feasibility_factors, "Feasibility Factors", "F");
	generateSubMatrix(ID_IMPACT_MATRIX, DATA.num_impact_factors, "Impact Factors", "I");
	calculateMatrix();
}

function generateRow(f, options, id) {
	var tr = document.createElement("tr");
	
	// Title
	var th;
	th = document.createElement("th");
	var label = `Factor ${(f + 1)}`;
	if (id == "F") {
		label = DATA.feasibility_labels[f];
	} else if (id == "I") {
		label = DATA.impact_labels[f];
	}
	th.innerHTML = `<input id="LABEL_${id}_${f}" type="text" value="${label}" oninput="onDataChanged();">`;
	tr.appendChild(th);
	
	// Weight slider
	var value;
	value = MAX_VALUE / 2 - MIN_VALUE;
	if (id == "F") {
		value = parseInt(DATA.feasibility_weights[f]);
	} else if (id == "I") {
		value = parseInt(DATA.impact_weights[f]);
	}
	tr.appendChild(generateSlider(`WEIGHT_${id}_${f}`, value));
	
	// Value sliders
	for (var o = 0; o < options; o++) {
		value = MAX_VALUE / 2 - MIN_VALUE;
		if (id == "F") {
			value = parseInt(DATA.feasibility_values[o][f]);
		} else if (id == "I") {
			value = parseInt(DATA.impact_values[o][f]);
		}
		tr.appendChild(generateSlider(`VALUE_${id}_${o}_${f}`, value));
	}
	
	return tr;
}

function generateSlider(id, value) {
	th = document.createElement("th");
	th.innerHTML = `<output>${LABELS[value]}</output> <br> ${LABELS[MIN_VALUE]} <input id="${id}" type="range" max="${MAX_VALUE}" min="${MIN_VALUE}" oninput="this.previousElementSibling.previousElementSibling.value = LABELS[this.value]; onDataChanged(); calculateMatrix();"> ${LABELS[MAX_VALUE]}`;
	th.childNodes[4].value = value;
	return th;
}