import createAction from "./createAction";

const changeSetting = createAction("changeSetting");
const switchTab = createAction("switchTab");
const toggleView = createAction("toggleView");

export default {
	changeSetting,
	switchTab,
	toggleView
};
