import { OBJECTS } from "../lib/objectList.js";

import FrameNode from "./frame.js";
import PatcherNode from "./patcher.js";
import ObjectNode from "./objectNode.js";
import ParamNode from "./paramNode.js";

import liveDisplayValueMixin from "./liveDisplayValueMixin.js";
import liveScalingObjectMixin from "./liveScalingObjectMixin.js";
import resourceObjectMixin from "./resourceObjectMixin.js";

const LIVE_DISPLAY_VALUE_OBJECT_TYPES = [OBJECTS.LIVE_DIAL, OBJECTS.LIVE_NUMBOX, OBJECTS.LIVE_SLIDER];
const LIVE_SCALING_OBJECT_TYPES = [OBJECTS.LIVE_DIAL, OBJECTS.LIVE_NUMBOX, OBJECTS.LIVE_SLIDER];
const RESOURCE_OBJECT_TYPES = [OBJECTS.FPIC, OBJECTS.LIVE_TAB, OBJECTS.LIVE_TEXT];

function getInstanceForObjectType(id, type, creationSeq, parentId) {
	// Patchers
	if (type === OBJECTS.PATCHER) {
		return new PatcherNode(id, type, creationSeq, parentId);
	}
	// Mira Frames
	else if (type === OBJECTS.MIRA_FRAME) {
		return new FrameNode(id, type, creationSeq, parentId);
	}

	let ObjClass = ObjectNode;

	// Certain objects, for example fpic, can have resources (only images for now)
	// Changes in certain parameters can trigger a resource request (these relationships are object-dependent)
	// Let it be known, this hard-coding causes us great pain
	if (RESOURCE_OBJECT_TYPES.indexOf(type) > -1) ObjClass = resourceObjectMixin(ObjClass);
	if (LIVE_SCALING_OBJECT_TYPES.indexOf(type) > -1) ObjClass = liveScalingObjectMixin(ObjClass);
	if (LIVE_DISPLAY_VALUE_OBJECT_TYPES.indexOf(type) > -1) ObjClass = liveDisplayValueMixin(ObjClass);

	return new ObjClass(id, type, creationSeq, parentId);
}

export {
	getInstanceForObjectType,

	FrameNode,
	PatcherNode,
	ObjectNode,
	ParamNode
};
