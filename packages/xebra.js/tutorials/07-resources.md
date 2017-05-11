### Object Resources

In order to render, many Max objects need data from local files. A typical example would be the `fpic` object, which displays an image. To manage this local file connection, Xebra uses a {@link Resource} object. Changing the value of the `pic` attribute in Max, or the `pic` parameter in Xebra, will update the `filename` parameter of the {@link Resource} object associated with the `fpic` ObjectNode. This will cause Max to look in its search path for an image with that name. Once it finds that image, it will send the data to the {@link Resource}, which can update the the `fpic` ObjectNode. Given an instance of an ObjectNode, you can see how many resources that node owns by calling `getResourceCount`

```
var fpicObject; // ObjectNode of type fpic
console.log(fpicObject.getResourceCount()); // prints '1'

var liveTextObject; // ObjectNode of type live.text
console.log(liveTextObject.getResourceCount()); // prints '2' (one for off, one for on)

var liveTabObject; // ObjectNode of type live.tab
console.log(liveTabObject.getResourceCount()); // depends on the number of tabs -- up to one resource per tab.
```

If you'd like to use the data that the {@link Resource} receives, you must listen for {@link Resource.event:data_received} events, which will be fired when the {@link Resource} receives data. The {@link Resource} doesn't actually hold on to the data itself, so you'll need to hook into this event to get the data. The event will fire a callback with both the filename and a data uri string containing the image data.

```
var fpicObject; // ObjectNode of type fpic
var imgElement = document.getElementsByTagName("img")[0]; // some image
var resource = fpicObject.getResourceAtIndex(0); // fpic's first and only resource
resource.on("data_received", function(filename, datauri) {
	imgElement.alt = filename;
	imgElement.src = datauri;
});
```

If the image is a .svg file, then Max will render it using its own drawing engine before sending the data over (this was done originally to guarantee that drawings would look the same in both Max and Mira). In this case, set the `dimensions` parameter to set the size at which Max should render the .svg image, before sending its data.

```
var fpicObject; // ObjectNode of type fpic
var resource = fpicObject.getResourceAtIndex(0); // fpic's first and only resource
resource.dimensions = {width: 100, height: 100};
fpicObject.setParamValue("pic", "elementjit.svg");
```

### Other Resources

It's not necessary to have an instance of {@link ObjectNode} to get an image {@link Resource} from Max. You can also create your own resources using the {@link State} object directly. Resources created this way can be used to pull image objects from Max's search path. To create such resources, use the {@link State.createResource} function.

```
var xebraState; // Instance of Xebra.State
var resource = xebraState.createResource();
resource.on("data_received", function(filename, datauri) {
	var body = document.getElementsByTagName("body")[0];
	body.style.backgroundImage = `url(${datauri})`;
});
resource.filename = "alex.png";
```

When you're finished with these resources, remember to call {@link Resource.destroy} to clean up the Resource's event listeners and avoid a memory leak.

```
resource.destroy();
resource = null;
```