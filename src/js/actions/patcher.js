import createAction from "./createAction";

const addPatcher = createAction("addPatcher");
const changePatcher = createAction("changePatcher");
const removePatcher = createAction("removePatcher");
const reset = createAction("reset");

export default {
	addPatcher,
	changePatcher,
	removePatcher,
	reset
};
