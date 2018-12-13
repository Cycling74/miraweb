/**
 * Connection States of XebraCommunicator
 * @static
 * @constant
 * @memberof XebraCommunicator
 * @type {object}
 * @property {number} INIT
 * @property {number} CONNECTING
 * @property {number} CONNECTED
 * @property {number} CONNECTION_FAIL
 * @property {number} RECONNECTING
 * @property {number} DISCONNECTED
 */
export const CONNECTION_STATES = Object.freeze({
	INIT: 1,
	CONNECTING: 2,
	CONNECTED: 4,
	CONNECTION_FAIL: 8,
	RECONNECTING: 16,
	DISCONNECTED: 32
});

/**
 * Xebra Protocol Version
 * @static
 * @constant
 * @memberof XebraCommunicator
 * @type {string}
 */
export const XEBRA_VERSION = "00.01.07";

/**
 * Xebra Protocol Messages
 * @static
 * @constant
 * @memberof XebraCommunicator
 * @type {object}
 * @property {string} ADD_NODE
 * @property {string} ADD_PARAM
 * @property {string} DELETE_NODE
 * @property {string} HANDLE_RESOURCE_DATA
 * @property {string} HANDLE_RESOURCE_INFO
 * @property {string} INIT_NODE
 * @property {string} MODIFY_NODE
 * @property {string} RESYNC
 * @property {string} SET_UUID
 * @property {string} STATEDUMP
 */
export const XEBRA_MESSAGES = {
	ADD_NODE: "add_node",
	ADD_PARAM: "add_param",
	CHANNEL_MESSAGE: "channel_message",
	CLIENT_PARAM_CHANGE: "client_param_change",
	CONNECTION_CHANGE: "connection_change",
	DELETE_NODE: "delete_node",
	HANDLE_RESOURCE_DATA: "handle_resource_data",
	HANDLE_RESOURCE_INFO: "handle_resource_info",
	INIT_NODE: "init_node",
	MODIFY_NODE: "modify_node",
	RESYNC: "resync",
	SET_UUID: "set_uuid",
	STATEDUMP: "statedump"
};
