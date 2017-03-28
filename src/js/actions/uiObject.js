import createAction from "./createAction";

const addObject = createAction("addObject");
const clear = createAction("clear");
const removeObject = createAction("removeObject");
const setObjects = createAction("setObjects");

export default {
	addObject,
	clear,
	removeObject,
	setObjects
};
