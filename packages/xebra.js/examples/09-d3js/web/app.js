// StateTree helpers
function buildFrameTree(frame) {
	var tree = {
		name : frame.getParamValue("tabname") || "mira.frame (" + frame.id + ")",
		children : []
	};

	frame.getObjects().forEach(function(obj) {
		tree.children.push({
			name : obj.type + "(" + obj.id + ")"
		});
	});

	return tree;
}

function buildPatcherTree(patcher) {
	var tree = {
		name : "Patch (" + patcher.name + ")",
		children : []
	}

	patcher.getFrames().forEach(function(frame) {
		tree.children.push(buildFrameTree(frame));
	});

	return tree;
}

function buildTreeJSON(patchers) {
	var tree = {
		name : "Xebra",
		children : []
	};

	patchers.forEach(function(patcher) {
		tree.children.push(buildPatcherTree(patcher));
	});

	return tree;
}

// XebraState Setup
var xebraState = new Xebra.State({
	hostname : "127.0.0.1", // localhost
	port : 8086
});

// Tree Setup
var horizMargin = 100;
var vertMargin = 20;
var width = 960 - 2 * horizMargin;
var height = 800 - 2 * vertMargin;

var svg = d3
	.select("body")
	.append("svg")
		.attr("width", width + 2 * horizMargin)
		.attr("height", height + 2 * vertMargin)
	.append("g")
		.attr("transform", "translate(" + horizMargin + "," + vertMargin + ")");

var g = svg.append("g");
var d3Tree = d3
	.tree()
	.size([width, height]);

function diagonal(d) {
	return "M" + d.y + "," + d.x
		+ "C" + (d.parent.y + 100) + "," + d.x
		+ " " + (d.parent.y + 100) + "," + d.parent.x
		+ " " + d.parent.y + "," + d.parent.x;
}

// D3 Update function
function update() {
	var stateTree = buildTreeJSON(xebraState.getPatchers());
	var nodes = d3.hierarchy(stateTree, function(d) {
		return d.children;
	});
	d3Tree(nodes);

	var link = g.selectAll(".link")
		.data(nodes.descendants().slice(1))
	.enter().append("path")
		.attr("class", "link")
		.attr("d", diagonal);

	var node = g.selectAll(".node")
		.data(nodes.descendants())
	.enter().append("g")
		.attr("class", function(d) { return "node" + (d.children ? " node--internal" : " node--leaf"); })
		.attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; });

	node.append("circle")
		.attr("r", 2.5);

	node.append("text")
		.attr("dy", function(d) { return d.children ? -10 : 0 })
		.attr("x", function(d) { return d.children ? -8 : 8; })
		.style("text-anchor", "start" )
		.text(function(d) { return d.data.name; });
}

window.onload = function() {

	// yep, let's connect
	xebraState.connect();

	// register for updates to the tree
	xebraState.on("loaded", function() {
		xebraState.on("patcher_added", update);
		xebraState.on("patcher_changed", update);
		xebraState.on("patcher_removed", update);
		xebraState.on("object_added", update);
		xebraState.on("object_removed", update);
		xebraState.on("frame_added", update);
		xebraState.on("frame_removed", update);
		update();
	});
};
