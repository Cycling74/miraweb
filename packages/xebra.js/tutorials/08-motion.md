### Sending Motion Data

Xebra can pass acceleration, rotation and compass data to Max. These motion updates are received by Max through the mira.motion object. Unlike other xebra parameters, which each belong to an instance of {@link ObjectNode}, the parameters that manage motion data are owned by the root {@link State} object. This is by design: motion updates are expected to occur frequently, on the order of 100 times a second, so all mira.motion objects share a group of global parameters.

Unlike other parameters, you don't update acceleration parameters directly by calling {@link ObjectNode.setParamValue}. Instead, the function {@link State.sendMotionData} is used. This object can send motion data corresponding to acceleration, gravity, orientation and rotation rate, as described in {@link Xebra.MOTION_TYPES}. Before sending motion data using this function, it's important to call {@link State.isMotionEnabled}. This will return true if the Max patch contains at least one mira.motion object. Otherwise it is pointless to send motion data, since there is no Max object to receive it. You can subscribe to {@link State.event#motion_enabled} and {@link State.event#motion_disabled} to be notified when the value of {@link State.isMotionEnabled} changes to true or false, respectively.

```
// Sending acceleration data
var xebraState; // Connected State object
var pollHandle; // Handle to the polling request
var epoch = Date.now() / 1000.0;

function pollMotionData() {
	// Generate some random acceleration data
	var accel = {
		x: Math.random() * 2 - 1,
		y: Math.random() * 2 - 1,
		z: Math.random() * 2 - 1,
	};

	var timestamp = (Date.now() / 1000.0) - epoch;

	// Send it to Max
	xebraState.sendMotionData(
		Xebra.MOTION_TYPES.ACCEL,
		accel.x,
		accel.y,
		accel.z,
		timestamp
	);

	if (xebraState.isMotionEnabled) {
		pollHandle = window.requestAnimationFrame(pollMotionData);
	}
}

function enablePolling() {
	pollMotionData();
}

function disablePolling() {
	if (pollHandle !== undefined) {
		window.cancelAnimationFrame(pollHandle);
	}
}

xebraState.on("motion_enabled", enablePolling);
xebraState.on("motion_disabled", disablePolling);
```

