### Enumerating Objects and Viewmode

After objects have been created, you can iterate over the objects currently in Xebra.State by iterating through the children of each patcher. This code snippet will print out the entire state currently contained in Xebra.State.

```
xebraState.on("loaded", function() {
	var patchers = xebraState.getPatchers();
	patchers.forEach( function(patcher) {
		console.log("Patcher", patcher.name);
		var objects = patcher.getObjects();
		objects.forEach( function(object) {
			console.log("\tObject", object.id, object.type);
			var paramTypes = object.getParamTypes();
			paramTypes.forEach( function(paramType) {
				console.log("\t\t", paramType, ":", object.getParamValue(paramType));
			});
		});
		console.log("\n");
	});
});
```

The {@link PatcherNode} instances each contain all of the {@link ObjectNode} instances within the given patcher. It is also possible to look for all of the objects that are within the bounds of a mira.frame object by iterating over {@link FrameNode} instances.

```
xebraState.on("loaded", function() {
	var patchers = xebraState.getPatchers();
	patchers.forEach( function(patcher) {
		console.log("Patcher", patcher.name);
		var frames = patcher.getFrames();
		frames.forEach( function(frame) {
			console.log("\tFrame", frame.id, "viewmode:", frame.viewMode);
			var objects = frame.getObjects();
			objects.forEach( function(object) {
				console.log("\t\tObject", object.id, object.type);
				var paramTypes = object.getParamTypes();
				paramTypes.forEach( function(paramType) {
					console.log("\t\t\t", paramType, ":", object.getParamValue(paramType));
				});
			});
		});
	});
});
```

The objects within a frame are those whose bounding rectangles intersect the bounding rectangle of the mira.frame. Whether or not this bounding rectangle is determined using the patching\_rect attribute or the presentation\_rect attribute depends on the value of `viewMode` for both the {@link PatcherNode} as well as the {@link FrameNode}. If the `viewMode` for a {@link FrameNode} is set to Xebra.VIEW_MODES.PATCHING, then the patching\_rect of the frame is used. If `viewMode` is set to Xebra.VIEW_MODES.PRESENTATION, then the presentation\_rect of the frame is used. If `viewMode` is set to Xebra.VIEW_MODES.LINKED, then the frame will use whatever value of `viewMode` the parent patcher is using.