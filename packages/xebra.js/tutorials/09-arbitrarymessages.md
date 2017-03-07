### Sending Arbitrary Messages

Since xebra.js 1.2.0, it's possible to send arbitrary messages to Max using the mira.channel object. You can now send strings, numbers, arrays of strings and numbers, and JSON objects directly to Max, where they will be forwarded to the appropriate mira.channel object and coerced into a Max message type. Strings become symbols, integers become integers, floats become floats and arrays become Max lists. JSON objects will be parsed into Max dictionaries, and arbitrarily nested JSON objects should be supported.

A mira.channel object must have a name as its first argument, which defines the name of that channel. To send a message to xebra.js, send any Max message to a mira.channel object. When the xebra state object receives a message, it will emit a {@link State.event:channel_message_received} event along with the contents of the message from Max. Something like the following could be used to receive a message from Max:

```
var xebraState; // connected to Max
xebraState.on("channel_message_received", function(name, data) {
	console.log("Received message on channel with name: " + name);
	console.log("Message contents: " + data);
});
```

To send a message to Max, use the {@link State#sendMessageToChannel} function on the xebra state object. This code will send a message to all mira.channel objects with the name françois:

```
var xebraState; // connected to Max
xebraState.sendMessageToChannel("françois", "Bonjour!");
```

In case you'd like to know which mira.channel objects currently exist in the Max application, xebra.js implements a {@link State#getChannelNames} function, which returns an array of all of the unique names of mira.channel objects in the Max patcher. This will return the names of all mira.channel objects in all patchers; it's also possible to get the names of mira.channel objects in a specific patcher by calling {@link PatcherNode#getChannelNames}  on a particular patcher:

```
var xebraState; // connected to Max
var patcher = xebraState.getPatchers()[0]; // get the first patcher
var channelNames = patcher.getChannelNames();
console.log("First patcher contains mira channels: " + channelNames.join(", "));
```
