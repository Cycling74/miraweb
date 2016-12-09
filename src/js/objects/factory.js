import UIObjects from "./index.js";


// Build Map for object class lookup by name
const UI_OBJECTS_BY_NAME = {};
const classNames = Object.keys(UIObjects);
for (let i = 0, il = classNames.length; i < il; i++) {
	const objClass = UIObjects[classNames[i]];
	UI_OBJECTS_BY_NAME[objClass.NAME] = objClass;
}


export function getInstance(stateObj) {
	if (UI_OBJECTS_BY_NAME[stateObj.type]) return new UI_OBJECTS_BY_NAME[stateObj.type](stateObj);
	return null;
}

export function getSupportedObjects() {
	return Object.keys(UI_OBJECTS_BY_NAME);
}
