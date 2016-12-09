import createAction from "./createAction";

const changeClientName = createAction("changeClientName");
const connect = createAction("connect");
const disconnect = createAction("disconnect");
const init = createAction("init");
const setSupportedObjects = createAction("setSupportedObjects");

export default {
	changeClientName,
	disconnect,
	connect,
	init,
	setSupportedObjects
};
