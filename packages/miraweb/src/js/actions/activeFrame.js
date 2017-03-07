import createAction from "./createAction";

const change = createAction("change");
const changeViewMode = createAction("changeViewMode");
const setDOMRect = createAction("setDOMRect");
const setScale = createAction("setScale");
const set = createAction("set");
const unset = createAction("unset");

export default {
	change,
	changeViewMode,
	setDOMRect,
	setScale,
	set,
	unset
};
