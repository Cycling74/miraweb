### Value, Distance and Other Funky Parameters

One part of working with xebra.js that may take some getting used to is that a parameter with a particular name, for example "value", doesn't necessarily mean the same thing for two different objects. Setting the "value" parameter of a button will cause the button to output a bang, but setting the value of a live.slider object will set the position of the slider. Also, it's correct to use the "value" parameter to update a flonum object, but one must use the "distance" parameter to update a slider. Here is a list of objects and parameters that might cause some confusion:

---

#### **button, message**

- **value**: Set to 1 to cause the object to output as if clicked

---

#### **live.dial, live.slider**

- **value**: Set the position of the object absolutely
- **distance**: Must be between 0 and 1, and will be automatically scaled to take into account the minimum, maximum and exponent

---

#### **live.text, live.toggle, toggle**

- **value**: 0 for off, 1 for on

---

#### **live.tab, umenu**

- **value**: Sets the active index. Indexes from 0, so setting this to 0 will select the first element.

---

#### **live.grid**

- **distance**: This would be the parameter that you would use to update a live.grid, but that functionality is currently not documented.

---

#### **number, flonum**

- **value**: Use this to change the value of the object (not distance)

---

#### **kslider**

- **value**: It is not possible to set value of a kslider object all at once. Rather, the value parameter must be two elements, the first being a MIDI pitch and the second velocity. To set a three-note chord, one would update the value parameter three times.

---

#### **slider, dial**

- **distance**: Use this param to update these objects. Unlike live.slider and live.dial, this parameter is not a value between 0 and 1, but rather a number between the 0 and the value of the size parameter. Note that the minimum is always 0!
- **min**: This param is not an actual minimum, but rather a number that is added to the object's value before output. So, given a slider with size 100 and min 32, setting the value of the slider to 10 will cause the slider to become 10% full and to output the number 42. Yes, this is confusing. I'm sorry.

---

#### **rslider**

- **distance**: Must be a pair of numbers, but otherwise works in the same confusing way as slider and dial.

---

#### **multislider**

- **distance**: Update as one long list. If you want to change the value of a particular slider, say slider number 13, try something like this:

- ```
var multislider;
var sliderVals = multislider.getParamValue("distance");
sliderVals[12] = 3.1415;
multislider.setParamValue("distance", sliderVals);
```