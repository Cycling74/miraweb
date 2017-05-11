### Supported Objects

Xebra listens to changes in the Max patcher, and will emit events whenever an object is added or removed. By default, Xebra will listen to changes for all of the objects in {@link Xebra.SUPPORTED_OBJECTS}; you can, however, use your own list of `supported_objects` if you would only like to process a subset of Max objects.

```
var xebraState = new Xebra.State({
	hostname: "127.0.0.1",
	port: 8086,
	supported_objects: ["live.grid"] // Will only register live.grid objects
});
```

### Listening for Objects

Whenever a new object is created in Max, Xebra.State will emit an "object_added" event {@link State.event:object_added}. When an object is removed, an "object_removed" event will be emitted {@link State.event:object_removed}. You can listen to these changes to make changes to your application, for example by adding to and removing from the DOM.

```
// Do something when a button gets added to the Max patcher
xebraState.on("object_added", function(object) {
	if (object.type === "button") addHTMLButton(object);
});

// Do something when a button is removed
xebraState.on("object_removed", function(object) {
	if (object.type === "button") removeHTMLButton(object);
});

function addHTMLButton(object) {
	var newButton = document.createElement("button");
	newButton.id = "button-" + object.id;
	newButton.appendChild(document.createTextNode("Button " + object.id));
	document.getElementById("container").appendChild(newButton);
}

function removeHTMLButton(object) {
	var button = document.getElementById("button-" + object.id);
	button.parentNode.removeChild(button);
}
```

### Listening to Object Changes

If the value of some object parameter changes, then Xebra.State will emit an "object_changed" event as well. This event will include both the object as well as the parameter.

```
xebraState.on("object_changed", function(object, param) {
	if (object.type === "button") {
		if (param.type === "bgcolor") {
			var button = document.getElementById("button-" + object.id);
			button.style.backgroundColor = colorToHex(param.value);
		}
	}
});

function colorToHex(colorArray) {
	return (
		"#" +
		Math.floor(colorArray[0] * 255).toString(16) +
		Math.floor(colorArray[1] * 255).toString(16) +
		Math.floor(colorArray[2] * 255).toString(16)
	);
}
```

### Setting Parameters

Updating the state of a parameter is as simple as calling {@link ObjectNode.setParamValue} with the name and value of the parameter you'd like to update.

```
var button; // ObjectNode bound to a button in Max
button.setParamValue("bgcolor", [1.0, 0.0, 0.0, 0.0]); // Make the button red
button.setParamValue("value", 1); // Make the button send a bang
```

For a complete list of all supported objects and parameters, see {@tutorial 00-objectlist}. Also be sure to see {@tutorial 06-valuevsdistance} for a list of unusual parameters.
