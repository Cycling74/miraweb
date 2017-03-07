import createAction from "./createAction";

const hidePopover = createAction("hidePopover");
const movePopover = createAction("movePopover");
const showPopover = createAction("showPopover");
const updatePopover = createAction("updatePopover");

export default {
	hidePopover,
	movePopover,
	showPopover,
	updatePopover
};
