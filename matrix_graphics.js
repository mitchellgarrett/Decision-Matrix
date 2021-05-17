const ID_GRAPH = "GRAPH";
const COLORS = ["red", "yellow", "green"];
const LABELS = ["None", "Below Average", "Average", "Above Average", "Most"];

function generateMatrix() {
    //saveData(DATA);
    document.getElementById(ID_MATRIX_TITLE).value = DATA.title;
	document.getElementById(ID_MATRIX_TITLE).size = document.getElementById(ID_MATRIX_TITLE).value.length;
	
    document.getElementById(ID_NUM_FEASIBILITY_FACTORS).value = DATA.num_feasibility_factors;
    document.getElementById(ID_NUM_IMPACT_FACTORS).value = DATA.num_impact_factors;
    document.getElementById(ID_NUM_OPTIONS).value = DATA.num_options;

	document.getElementById(ID_MATRIX).innerHTML = "";
    generateSubMatrix(DATA.num_feasibility_factors, "Feasibility Factors", "F");
    generateSubMatrix(DATA.num_impact_factors, "Impact Factors", "I");
    calculateMatrix();
}

function updateLabel(id, label) {
	var inputs = document.getElementsByTagName("input");
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].id == id) {
			inputs[i].value = label;
			inputs[i].size = label.length;
		}
	}
}

function generateSubMatrix(factors, title, id) {
    var options = DATA.num_options;

    var matrix = document.getElementById(ID_MATRIX);

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
        th.innerHTML = `<input id="LABEL_O_${o}" type="text" value="${DATA.option_labels[o]}" oninput="updateLabel(this.id, this.value); onDataChanged(); this.size=this.value.length; calculateMatrix();">`;
		th.childNodes[0].size = th.childNodes[0].value.length;
        tr.appendChild(th);

        if (o == options - 1) {
            var minus = document.createElement("button");
            minus.innerHTML = "-";
            minus.onclick = () => { clampFactors("O", -1); onDataChanged(); generateMatrix(); }
            th.appendChild(minus);

            var plus = document.createElement("button");
            plus.innerHTML = "+";
            plus.onclick = () => { clampFactors("O", 1); onDataChanged(); generateMatrix(); }
            th.appendChild(plus);
        }
    }

    // Rows
    for (var f = 0; f < factors; f++) {
        matrix.appendChild(generateRow(f, options, id));
    }

    // Outputs
    tr = document.createElement("tr");
    matrix.appendChild(tr);

    th = document.createElement("th");

    var minus = document.createElement("button");
    minus.innerHTML = "-";
    minus.onclick = () => { clampFactors(id, -1); onDataChanged(); generateMatrix(); }
    th.appendChild(minus);

    var plus = document.createElement("button");
    plus.innerHTML = "+";
    plus.onclick = () => { clampFactors(id, 1); onDataChanged(); generateMatrix(); }
    th.appendChild(plus);

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
    th.innerHTML = `<input id="LABEL_${id}_${f}" type="text" value="${label}" oninput="onDataChanged(); this.size=this.value.length;">`;
	th.childNodes[0].size = th.childNodes[0].value.length;
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

function drawGraph(xs, ys) {
	const graph = document.getElementById(ID_GRAPH);
	graph.innerHTML = "";
	
	const NS = "http://www.w3.org/2000/svg";
	const BORDER = 10;
	const SCALE = 0.5;
	const TOTAL_WIDTH = window.innerWidth * SCALE;
	const TOTAL_HEIGHT = TOTAL_WIDTH * SCALE;
	
    const MIN_X = BORDER;
    const MAX_X = TOTAL_WIDTH - BORDER;
    const MIN_Y = BORDER;
    const MAX_Y = TOTAL_HEIGHT - BORDER;
    const WIDTH = MAX_X - MIN_X;
    const HEIGHT = MAX_Y - MIN_Y;
	
	// Set height/width
	graph.setAttribute("width", TOTAL_WIDTH);
	graph.setAttribute("height", TOTAL_HEIGHT);
	
	// Set title/description
	/*const title = document.createElementNS(NS, "title");
	title.innerHTML = "feasibility vs. impact chart";
	graph.appendChild(title);*
	
	const desc = document.createElementNS(NS, "desc");
	desc.innerHTML = "Here is a graph description";
	graph.appendChild(desc);*/
	
	// Draw outline
	const outline = document.createElementNS(NS, "g");
	
	var r = document.createElementNS(NS, "rect");
	r.setAttribute("width", WIDTH);
	r.setAttribute("height", HEIGHT);
	r.setAttribute("style", "fill: white; stroke: black; stroke-width: 1;");
	r.setAttribute("x", MIN_X);
	r.setAttribute("y", MIN_Y);
	outline.appendChild(r);
	
	var l = document.createElementNS(NS, "line");
	l.setAttribute("x1", MIN_X + WIDTH / 2);
	l.setAttribute("y1", MIN_Y);
	l.setAttribute("x2", MIN_X + WIDTH / 2);
	l.setAttribute("y2", MAX_Y);
	l.setAttribute("style", "stroke: black; stroke-width: 1;")
	outline.appendChild(l);
	
	var l = document.createElementNS(NS, "line");
	l.setAttribute("x1", MIN_X);
	l.setAttribute("y1", MIN_Y + HEIGHT / 2);
	l.setAttribute("x2", MAX_X);
	l.setAttribute("y2", MIN_Y + HEIGHT / 2);
	l.setAttribute("style", "stroke: black; stroke-width: 1;")
	outline.appendChild(l);
	
	var t = document.createElementNS(NS, "text");
	t.innerHTML = "Feasibility";
	t.setAttribute("fill", "black");
	t.setAttribute("font-weight", "bold");
	t.setAttribute("text-anchor", "middle");
	t.setAttribute("x", MIN_X + WIDTH / 2);
	t.setAttribute("y", MAX_Y + BORDER);
	outline.appendChild(t);
	
	var t = document.createElementNS(NS, "text");
	t.innerHTML = "Impact";
	t.setAttribute("fill", "black");
	t.setAttribute("font-weight", "bold");
	t.setAttribute("text-anchor", "middle");
	t.setAttribute("x", MIN_X);
	t.setAttribute("y", MIN_Y + HEIGHT / 2);
	t.setAttribute("transform", `rotate(-90, ${MIN_X}, ${MIN_Y + HEIGHT / 2})`);
	outline.appendChild(t);
	
	graph.appendChild(outline);
	
	// Draw points
	for (var i = 0; i < xs.length; i++) {
		const point = document.createElementNS(NS, "g");
		
		var color = COLORS[0];
		if (xs[i] >= 0.75 && ys[i] >= 0.75) {
            color= COLORS[2];
        } else if (xs[i] >= 0.5 && ys[i] >= 0.5) {
            color = COLORS[1];
		}
		
		const c = document.createElementNS(NS, "circle");
		const r = 15;
		const x = MIN_X + r + xs[i] * (WIDTH - r * 2);
		const y = MAX_Y - r - ys[i] * (HEIGHT - r * 2);
		
		c.setAttribute("cx", x);
		c.setAttribute("cy", y);
		c.setAttribute("r", r);
		c.setAttribute("stroke", "black");
		c.setAttribute("fill", color);
		point.appendChild(c);
		
		var t = document.createElementNS(NS, "text");
		t.setAttribute("fill", "black");
		t.setAttribute("font-weight", "bold");
		t.setAttribute("text-anchor", "middle");
		t.setAttribute("dominant-baseline", "middle");
		t.setAttribute("x", x);
		t.setAttribute("y", y);
		t.innerHTML = (i + 1);
		point.appendChild(t);
		
		var t = document.createElementNS(NS, "text");
		t.setAttribute("fill", "black");
		t.setAttribute("text-anchor", "middle");
		t.setAttribute("dominant-baseline", "hanging");
		t.setAttribute("x", x);
		t.setAttribute("y", y + r);
		t.innerHTML = DATA.option_labels[i];
		point.appendChild(t);
		
		graph.appendChild(point);
	}
}

function drawGraph_Old(xs, ys) {
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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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
    ctx.fillText("Feasibility", MIN_X + WIDTH / 2, MAX_Y);
    ctx.translate(0, MIN_Y + HEIGHT / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Impact", 0, 0);
    ctx.restore();

    // Draw points
    for (var i = 0; i < xs.length; i++) {
        if (xs[i] >= 0.75 && ys[i] >= 0.75) {
            ctx.fillStyle = COLORS[2];
        } else if (xs[i] >= 0.5 && ys[i] >= 0.5) {
            ctx.fillStyle = COLORS[1];
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