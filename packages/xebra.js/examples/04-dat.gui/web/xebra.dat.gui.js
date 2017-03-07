var canvasConfig = null;

var __typeParamMap = Object.freeze({
	boolean: "value",
	string: "textfield",
	number: "distance",
	function: "value"
});

var __controllerUpdateMap = Object.freeze({
	boolean: function(param, controller) {param.value === 0 ? false : true;},
	string: "textfield",
	number: "distance",
	function: "value"
});

function maxParamNameForController(controller) {
	var controllerType = typeof controller.getValue();
	if (controllerType && __typeParamMap.hasOwnProperty(controllerType)) return __typeParamMap[controllerType];
	return null;
}

function maxParamNameForControllerOption(maxObject, controller, optionName) {
	switch (optionName) {
		case "min":
			return "min";
		case "max":
			return "size";
		default:
			return null;
	}
}

function updateControllerForMaxObject(controller, maxObject, param) {
	var valueParamName = maxParamNameForController(controller);
	if (valueParamName === param.type) {
		switch (typeof controller.getValue()) {
			case "boolean":
				controller.object[controller.property] = param.value === 0 ? false : true;
				break;
			case "string":
				controller.object[controller.property] = param.value;
				break;
			case "number":
				controller.object[controller.property] = param.value;
				break;
			case "function":
				if (param.value !== 0) controller.object[controller.property]();
				break;
		}
		controller.updateDisplay();
	}
}

function updateMaxObjectForController(maxObject, controller) {
	var maxParamName = maxParamNameForController(controller);
	if (maxParamName) maxObject.setParamValue(maxParamName, controller.object[controller.property]);

	if (controller.__min !== undefined) {
		var minParamName = maxParamNameForControllerOption(maxObject, controller, "min");
		maxObject.setParamValue(minParamName, controller.__min);
	}
	if (controller.__max !== undefined) {
		var sizeParamName = maxParamNameForControllerOption(maxObject, controller, "max");
		var minimum = controller.__min !== undefined ? controller.__min : 0;
		maxObject.setParamValue(sizeParamName, controller.__max - minimum);
	}
}

function updateMaxStateForController(xebraState, controller) {
	var xebraObjects = xebraState.getObjectsByScriptingName(controller.property);
	xebraObjects.forEach(function(xebraObject) {
		updateMaxObjectForController(xebraObject, controller);
	});
}

function bindControllerToXebra(controller, xebraState) {
	controller.onChange(function() {
		updateMaxStateForController(xebraState, controller);
	});

	var oldMin = controller.min;
	if (oldMin) {
		controller.min = function() {
			var __this = oldMin.apply(controller, arguments);
			updateMaxStateForController(xebraState, __this);
			return __this;
		};
	}
	var oldMax = controller.max;
	if (oldMax) {
		controller.max = function() {
			var __this = oldMax.apply(controller, arguments);
			updateMaxStateForController(xebraState, __this);
			return __this;
		};
	}

	updateMaxStateForController(xebraState, controller);
}

function bindGuiToXebra(gui, xebraState) {
	// bind existing controllers
	gui.__controllers.forEach( function(controller) {
		bindControllerToXebra(controller, xebraState);
	});

	// Monkey patching, so that if you add more controllers those get bound as well
	var oldAdd = gui.add;
	gui.add = function() {
		var controller = oldAdd.apply(gui, arguments);
		bindControllerToXebra(controller, xebraState);
		return controller;
	};

	// When a new max object has its varname set, be sure to update it with the appropriate controllers
	xebraState.on("object_changed", function(maxObject, param) {
		if (param.type === "varname") {
			var controller = gui.__controllers.find(function(controller) {return controller.property === param.value});
			if (xebraState.isStateLoaded) if (controller) updateMaxObjectForController(maxObject, controller);
		}

		else if (xebraState.isStateLoaded) {
			var controller = gui.__controllers.find(function(controller) {return controller.property === maxObject.getParamValue("varname")});
			if (controller) updateControllerForMaxObject(controller, maxObject, param);
		}
	});

	// Be sure to update all Max objects once the state is loaded
	xebraState.on("loaded", function() {
		gui.__controllers.forEach( function(controller) {
			updateMaxStateForController(xebraState, controller);
		});
	});
}