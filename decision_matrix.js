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
	"num_feasibility_factors" : "3",
	"num_impact_factors" : "3",
	"num_options" : "3",
	"feasibility_factors" : [],
	"impact_factors" : [],
	"options" : [],
	"weights" : [],
	"feasibility_values" : [],
	"impact_values" : []
};

function saveData(data) {
	window.localStorage.setItem(ID_DATA, JSON.stringify(data));
}

function loadData() {
	var data = window.localStorage.getItem(ID_DATA);
	if (data != null) {
		DATA = JSON.parse(data);
	}
}

function initializeMatrix() {
	loadData();
	generateMatrix();
}

function calculateSubMatrix(factorType, id) {
	var factors = document.getElementById(factorType).value;
	var options = document.getElementById(ID_NUM_OPTIONS).value;
	
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
			var value = parseInt(document.getElementById(`VALUE_${id}_${f}_${o}`).value);
			sum += weight * (value - MIN_VALUE);
		}
		
		values.push(sum / total);
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
	xs = calculateSubMatrix(ID_NUM_FEASIBILITY_FACTORS, "F");
	ys = calculateSubMatrix(ID_NUM_IMPACT_FACTORS, "I");
	drawGraph(xs, ys);
}

function generateSubMatrix(matrixType, factorType, title, id) {
	var factors = document.getElementById(factorType).value;
	var options = document.getElementById(ID_NUM_OPTIONS).value;
	
	window.localStorage.setItem(factorType, factors);
	window.localStorage.setItem(ID_NUM_OPTIONS, options);
	
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
		th.innerHTML = `<input type="text" value="Option ${(o + 1)}">`;
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
	saveData(DATA);
	generateSubMatrix(ID_FEASIBILITY_MATRIX, ID_NUM_FEASIBILITY_FACTORS, "Feasibility Factors", "F");
	generateSubMatrix(ID_IMPACT_MATRIX, ID_NUM_IMPACT_FACTORS, "Impact Factors", "I");
	calculateMatrix();
}

function generateRow(f, options, id) {
	var tr = document.createElement("tr");
	
	// Title
	var th;
	th = document.createElement("th");
	th.innerHTML = `<input type="text" value="Factor ${(f + 1)}">`;
	tr.appendChild(th);
	
	// Weight slider
	tr.appendChild(generateSlider(`WEIGHT_${id}_${f}`));
	
	// Value sliders
	for (var o = 0; o < options; o++) {
		tr.appendChild(generateSlider(`VALUE_${id}_${f}_${o}`));
	}
	
	return tr;
}

function generateSlider(id) {
	th = document.createElement("th");
	th.innerHTML = `<output>${LABELS[MAX_VALUE / 2 - MIN_VALUE]}</output> <br> ${LABELS[MIN_VALUE]} <input id="${id}" type="range" max="${MAX_VALUE}" min="${MIN_VALUE}" oninput="this.previousElementSibling.previousElementSibling.value = LABELS[this.value]; calculateMatrix();"> ${LABELS[MAX_VALUE]}`;
	return th;
}