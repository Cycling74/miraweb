# dat.gui

1. Open max/dat.maxpat
2. Open web/index.html
3. Change values in Max, see the changes reflected in dat.gui
4. Change values in dat.gui, see the changes reflected in Max

The dat.gui library is a simple utility for adding sliders and other UI controls to a web application. Developers ofter use dat.gui to control three.js, p5.js, tone.js and other creative coding tools. This example shows how to use the xebra.dat.gui.js utility file to create automatic bindings between Max and dat.gui. This utility looks at the @varname attribute of Max objects, and uses that value to match the Max object to a dat.gui parameter of the same name.
