import MiraUIObject from "./base.js";
import { default as buildRange } from "lodash/range.js";

export default class Kslider extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this._activeKey = null;
		this._dragsDoAdd = false;
		this._keyForTouch = {};
	}

	_isBlackKey(key) {
		const blackKeys = [1, 3, 6, 8, 10];
		return blackKeys.indexOf(key % 12) > -1;
	}

	_noteIsOn(note) {
		let retval = false;
		const mode = this._state.getParamValue("mode");
		const value = this._state.getParamValue("value");
		switch (mode) {
			case this.constructor.KsliderModes.KSMonophonic:
				if (!Array.isArray(value)) {
					retval = (note === value);
				} else {
					retval = (value[0] === note);
				}
				break;
			case this.constructor.KsliderModes.KSPolyphonic:
			case this.constructor.KsliderModes.KSTouchscreen:
			default:
				for (let i = 0; i < value.length; i += 2) {
					if (value[i] === note && value[i + 1] !== 0) {
						retval = true;
						break;
					}
				}
				break;
		}
		return retval;
	}

	_noteIsBeingTouched(note) {
		const mode = this._state.getParamValue("mode");
		if (mode === this.constructor.KsliderModes.KSTouchscreen) {
			for (let touch in this._keyForTouch) {
				if (this._keyForTouch.hasOwnProperty(touch)) {
					if (this._keyForTouch[touch] === note) {
						return true;
					}
				}
			}
			return false;
		}
		return note === this._activeKey;
	}

	paint(mgraphics, params) {
		const { width, height, blackkeycolor, hkeycolor, offset,
			range, selectioncolor, whitekeycolor } = params;

		const rootNote = offset - (this._isBlackKey(offset) ? 1 : 0);
		const activeRange = range - (this._isBlackKey(rootNote + range - 1) ? 1 : 0);
		const whiteKeys = buildRange(activeRange).map(x => (this._isBlackKey(x + rootNote) ? 0 : 1)).reduce((x, y) => x + y);
		const whiteKeyWidth = width / whiteKeys;
		const blackKeyWidth = whiteKeyWidth * (7 / 12);

		// Draw the white keys
		let currX = 0;
		for (let i = 0; i <= activeRange; i++) {
			let key = offset + i;
			let note = (key) % 12;
			let blk = this._isBlackKey(note);

			if (blk && i === 0) {
				if (this._noteIsOn(key - 1)) {
					mgraphics.set_source_rgba(hkeycolor);
				} else {
					mgraphics.set_source_rgba(whitekeycolor);
				}
				mgraphics.rectangle(currX, 0, whiteKeyWidth, height);
				mgraphics.fill();
				currX += whiteKeyWidth;
				mgraphics.set_line_width(1);
				mgraphics.set_source_rgba(blackkeycolor);
				mgraphics.stroke();
				mgraphics.add_attribute("key", key - 1);
			}

			if (this._noteIsBeingTouched(key)) {
				mgraphics.set_source_rgba(selectioncolor);
			} else if (this._noteIsOn(key)) {
				mgraphics.set_source_rgba(hkeycolor);
			} else {
				mgraphics.set_source_rgba(blk ? blackkeycolor : whitekeycolor);
			}
			if (!blk && i !== range) {
				mgraphics.rectangle(currX, 0, whiteKeyWidth, height);
				mgraphics.fill();
				currX += whiteKeyWidth;
				mgraphics.set_line_width(1);
				mgraphics.set_source_rgba(blackkeycolor);
				mgraphics.stroke();
				mgraphics.add_attribute("key", key);
			}
		}

		currX = 0;
		for (let i = 0; i < activeRange - 1; i++) {
			let key = offset + i;
			let note = (offset + i) % 12;
			let blk = this._isBlackKey(note);

			if (this._noteIsBeingTouched(key)) {
				mgraphics.set_source_rgba(selectioncolor);
			} else if (this._noteIsOn(key)) {
				mgraphics.set_source_rgba(hkeycolor);
			} else {
				mgraphics.set_source_rgba(blk ? blackkeycolor : whitekeycolor);
			}
			if (blk && i === 0) {
				currX += whiteKeyWidth;
			}

			if (!blk) {
				currX += whiteKeyWidth;
			} else {
				if (i !== range) {
					mgraphics.rectangle(currX - (blackKeyWidth / 2), 0, blackKeyWidth, height * 0.6);
					mgraphics.fill();
					mgraphics.set_line_width(1);
					mgraphics.set_source_rgba(blackkeycolor);
					mgraphics.stroke();
					mgraphics.add_attribute("key", key);
				}
			}
		}
	}

	_handleTouchEvent(touchPhase, event) {
		const key = event.attributes.key;
		const mode = this._state.getParamValue("mode");
		let velocity = 0;
		if (key && !isNaN(key)) {
			velocity = this._isBlackKey(key) ? event.normTargetY / 0.6  : event.normTargetY;
			velocity = Math.min(Math.floor(velocity * 126), 126) + 1;
		}

		if (mode === this.constructor.KsliderModes.KSTouchscreen) {
			if (touchPhase === this.constructor.KsliderTouchPhases.KSTouchDown) {
				this._keyForTouch[event.id] = key;
				this.setParamValue("rawsend", [key, velocity]);
			} else if (touchPhase === this.constructor.KsliderTouchPhases.KSTouchMoved) {
				if (this._keyForTouch[event.id] !== key) {
					let oldKey = this._keyForTouch[event.id];
					this._keyForTouch[event.id] = key;
					this.setParamValue("rawsend", [oldKey, 0]);
					this.setParamValue("rawsend", [key, velocity]);
				}
			} else {
				let oldKey = this._keyForTouch[event.id];
				delete this._keyForTouch[event.id];
				this.setParamValue("rawsend", [oldKey, 0]);
			}
		} else if (this._activeKey !== key) {
			this._activeKey = key;

			if (key && !isNaN(key)) {
				// Need to handle the touch differently, depending on the interaction mode
				if (mode === this.constructor.KsliderModes.KSMonophonic) {
					this.setParamValue("value", key);
				} else if (mode === this.constructor.KsliderModes.KSPolyphonic) {

					// Add a note if the place where you're touching is off, but skip
					// if it's already on
					let shouldAdd;
					let shouldSkip = false;
					console.log(touchPhase);
					console.log(this.constructor.KsliderTouchPhases.KSTouchDown);
					if (touchPhase === this.constructor.KsliderTouchPhases.KSTouchDown) {
						console.log("hi");
						shouldAdd = !this._noteIsOn(key);
					} else {
						shouldAdd = this._dragsDoAdd;
						shouldSkip = (this._dragsDoAdd === this._noteIsOn(key));
					}

					if (!shouldSkip) {
						// If the note is already in the array of on notes, then you need to remove it
						if (!shouldAdd) {
							const value = this._state.getParamValue("value");
							const noteIdx = value.findIndex(function (element, index) {
								return (element === key) && (index % 2 === 0);
							});
							if (noteIdx > -1) {
								this.setParamValue("rawsend", [key, 0]);
							}

							// All subsequent touches should delete on notes only
							if (touchPhase === this.constructor.KsliderTouchPhases.KSTouchDown) {
								this._dragsDoAdd = false;
							}
						}

						// Otherwise, add the note to the array of notes
						else {
							this.setParamValue("rawsend", [key, velocity]);
							// this.setParamValue("value", value);

							// All subsequent touches should add notes only
							if (touchPhase === this.constructor.KsliderTouchPhases.KSTouchDown)
							{this._dragsDoAdd = true;}
						}
					}
				}
			}
		}
	}

	pointerDown(event, params) {
		this._handleTouchEvent(this.constructor.KsliderTouchPhases.KSTouchDown, event);
	}

	pointerMove(event, params) {
		this._handleTouchEvent(this.constructor.KsliderTouchPhases.KSTouchMoved, event);
	}

	pointerUp(event, params) {
		this._handleTouchEvent(this.constructor.KsliderTouchPhases.KSTouchEnded, event);
		this._activeKey = null;
		this.render();
	}
}

Kslider.NAME = "kslider";

Kslider.KsliderModes = Object.freeze({
	KSMonophonic: "Monophonic",
	KSPolyphonic: "Polyphonic",
	KSTouchscreen: "Touchscreen"
});

Kslider.KsliderTouchPhases = Object.freeze({
	KSTouchDown: "KSTouchDown",
	KSTouchMoved: "KSTouchMoved",
	KSTouchEnded: "KSTouchEnded"
});
