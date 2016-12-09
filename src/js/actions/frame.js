import createAction from "./createAction";

const addFrame = createAction("addFrame");
const changeFrame = createAction("changeFrame");
const removeFrame = createAction("removeFrame");
const reset = createAction("reset");
const setGlobalViewMode = createAction("setGlobalViewMode");

export default {
	addFrame,
	changeFrame,
	removeFrame,
	reset,
	setGlobalViewMode
};
