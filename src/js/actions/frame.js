import createAction from "./createAction";

const addFrame = createAction("addFrame");
const changeFrame = createAction("changeFrame");
const removeFrame = createAction("removeFrame");
const reset = createAction("reset");

export default {
	addFrame,
	changeFrame,
	removeFrame,
	reset
};
