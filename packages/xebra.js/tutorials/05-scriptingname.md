### Scripting Name

Every object within a Max patcher has an attribute called `varname`. The value of this attribute must be unique among all objects in that patcher. So, using this attribute, it is possible to select a specific object within a Max patcher. If, for example, there is a button in a Max patcher with the `varname` "reset", one could write a function to trigger that button:

```
function resetPatcher() {
	var patcher = xebraState.getPatchers()[0]; // Assuming it's the first patcher
	var object = patcher.getObjectByScriptingName("reset");
	if (object) {
		object.setParamValue("value", 1);
	}
}
```
