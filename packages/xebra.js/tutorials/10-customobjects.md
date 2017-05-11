### Supporting Custom Objects

Xebra.js supports many objects out of the box, which can be found in {@link Xebra.SUPPORTED_OBJECTS}. However, this is nothing more than a dictionary of objects along with attributes for each object. It is possible to receive notifications about objects in the Max patch outside of this built-in list of supported objects. For example, one could use code like this to listen to the frequency attribute of *cycle~* objects:

```
var options = {
	hostname: "127.0.0.1",
	port: 8086,
	supported_objects: Xebra.SUPPORTED_OBJECTS.concat(
		{ name : "cycle~", parameters : ["frequency"] }
	)
};
var xebraState = new Xebra.State(options);

xebraState.on("object_added", logFrequencyForCycles);
xebraState.on("object_changed", logFrequencyForCycles);

function logCycleFrequency(object, param) {
	if (object.type === "cycle~") {
		if (param === undefined || param.type === "frequency") {
			console.log(`Cycle~ object with id: ${object.id} has frequnecy ${param.value}`);
		}
	}
}
```

A word of warning, this will only work for objects with user-visible attributes. It's not currently possible, for example, to update the state of a *pictslider* object in this way, because the position of the *pictslider* knob is not a visible attribute of the *pictslider* object (it can't be configured from the inspector or using an *attrui* object). One could change the minimum and maximum value of a *pictslider* object from xebra.js, but not the position of the knob. Objects that can be updated in this way from xebra.js, like *slider* and *dial*, must be handled specially in Max.

This functionality may one day be extended to objects like *pictslider*, but it would require a change to *mira.frame* and, potentially, Max itself.
