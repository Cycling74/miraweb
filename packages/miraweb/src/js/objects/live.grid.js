import MiraUIObject from "./base.js";

export default class LiveGrid extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this._typeForTouch = {};
		this._lastPositionForTouch = {};
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			bgstepcolor,
			bgstepcolor2,
			bordercolor,
			hbgcolor,
			columns,
			direction,
			direction_height,
			directioncolor,
			marker_horizontal,
			marker_vertical,
			mode,
			rows,
			spacing,
			stepcolor,
			currentstep,
			distance
		} = params;
		let { rounded } = params;
		const directionMargin = this.constructor.DIRECTION_MARGIN;
		const buttonWidth = width / columns;
		const buttonHeight = (direction === 1) ? ((height - direction_height - directionMargin ) / rows) : (height / rows);
		rounded = Math.min(rounded, buttonHeight / 2 - 0.5);

		const inactiveConstraintsCells = distance[3];
		const activeStepCells = distance[4];
		const inactiveValues = distance.slice(5, 5 + inactiveConstraintsCells);
		const stepValues = distance.slice(5 + inactiveConstraintsCells, 5 + inactiveConstraintsCells + activeStepCells);
		const directionValues = distance.slice(5 + inactiveConstraintsCells + activeStepCells);

		// Draw the cells
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				let x = (j * buttonWidth) + spacing;
				let y = (i * buttonHeight) + spacing;
				let cellValue = (j * 1000) + (rows - i - 1);

				// Color depending on state
				if (mode === "Step Edit") {
					if (inactiveValues.indexOf(cellValue) > -1) mgraphics.set_source_rgba([0, 0, 0, 0]);
					else if (stepValues.indexOf(cellValue) > -1) mgraphics.set_source_rgba(stepcolor);
					else if (((i + 1) % marker_vertical === 0) || (j % marker_horizontal === 0)) mgraphics.set_source_rgba(bgstepcolor);
					else mgraphics.set_source_rgba(bgstepcolor2);
				}
				else if (mode === "Step constraint") {
					if (inactiveValues.indexOf(cellValue) > -1) mgraphics.set_source_rgba([0, 0, 0, 0]);
					else mgraphics.set_source_rgba(stepcolor);
				}

				let cellRect = [
					(j * buttonWidth) + spacing,
					(i * buttonHeight) + spacing,
					buttonWidth - (2 * spacing),
					buttonHeight - (2 * spacing)
				];
				mgraphics.rectangle(...cellRect, rounded);
				mgraphics.fill();
				mgraphics.set_source_rgba(bordercolor);
				mgraphics.set_line_width(0.5);
				mgraphics.stroke();

				// Draw a transparent rectangle, then add identifying attrs
				// Add identifying information for touch events later
				// Deliberately ignore rounding and spacing, so it's not possible to touch "between" cells
				mgraphics.set_source_rgba([0, 0, 0, 0]);
				x -= spacing;
				y -= spacing;
				mgraphics.rectangle(x, y, buttonWidth, buttonHeight);
				mgraphics.fill();
				mgraphics.add_attribute("col", j);
				mgraphics.add_attribute("row", (rows - i - 1));
				mgraphics.add_attribute("cell_type", "cell");
			}
		}

		// Draw the directions row
		if (direction === 1) {
			const directionBounds = { width : buttonWidth - 2 * spacing, height : direction_height - 1};
			for (let i = 0; i < columns; i++) {
				let x = (i * buttonWidth) + spacing;
				let y = rows * buttonHeight + directionMargin;
				const padding = 2 * spacing;
				const triangleBase = direction_height - (2 * spacing) - (2 * padding);
				const triangleHeight = buttonWidth - (4 * padding);

				mgraphics.rectangle(x, y, directionBounds.width, directionBounds.height, rounded);
				mgraphics.set_source_rgba(bordercolor);
				mgraphics.set_line_width(0.5);
				mgraphics.stroke();
				mgraphics.set_source_rgba(directioncolor);

				// Triangle left
				if (directionValues[i] === 2) {
					mgraphics.polygon(x + (2 * padding), y + padding, [[0, 0], [0, triangleBase], [triangleHeight, triangleBase / 2]]);
					mgraphics.fill();
				}
				// Triangle right
				else if (directionValues[i] === 0) {
					mgraphics.polygon(x + (2 * padding), y + padding, [[0, triangleBase / 2], [triangleHeight, 0], [triangleHeight, triangleBase]]);
					mgraphics.fill();
				}
				// Cross
				else if (directionValues[i] === 1) {
					let startX = (1 / 4) * buttonWidth;
					let startY = (1 / 4) * direction_height;
					mgraphics.set_line_width(2);
					mgraphics.move_to((i * buttonWidth) + startX, y + startY);
					mgraphics.line_to((i * buttonWidth) + buttonWidth - startX, y + direction_height - startY);
					mgraphics.stroke();

					mgraphics.move_to((i * buttonWidth) + buttonWidth - startX, y + startY);
					mgraphics.line_to((i * buttonWidth) + startX, y + direction_height - startY);
					mgraphics.stroke();
				}

				// Draw a transparent rectangle, then add identifying attrs
				mgraphics.set_source_rgba([0, 0, 0, 0]);
				mgraphics.rectangle(x, y, directionBounds.width, directionBounds.height, rounded);
				mgraphics.fill();
				mgraphics.add_attribute("col", i);
				mgraphics.add_attribute("cell_type", "direction");
			}
		}
		// Draw current step indicator
		mgraphics.set_source_rgba(hbgcolor);
		mgraphics.rectangle(buttonWidth * (currentstep - 1), 0, buttonWidth, buttonHeight * rows);
		mgraphics.fill();
	}

	pointerDown(event, params) {
		const { cell_type, col, row } = event.attributes;
		this._typeForTouch[ event.id ] = cell_type;
		if (cell_type === "cell") {
			this.setParamValue("touchy", [ "touched", `${event.id}`, col, row ]);
			this._lastPositionForTouch[ event.id ] = { col, row };
		} else if (cell_type === "direction") {
			this.setParamValue("touchy", [ "touched_direction", `${event.id}`, col, 0 ]);
		}
	}

	pointerMove(event, params) {
		const touchType = this._typeForTouch[ event.id ];
		const lastPosition = this._lastPositionForTouch[ event.id ];
		const { cell_type, col, row } = event.attributes;

		if (touchType === "cell" && cell_type === "cell") {
			if (lastPosition.col !== col || lastPosition.row !== row) {
				this.setParamValue("touchy", [ "moved", `${event.id}`, col, row ]);
				this._lastPositionForTouch[ event.id ] = { col, row };
			}
		}
	}

	pointerUp(event, params) {
		this.setParamValue("touchy", [ "removed_finger", `${event.id}`, 0, 0 ]);
		delete this._typeForTouch[ event.id ];
	}
}

LiveGrid.NAME = "live.grid";
LiveGrid.DIRECTION_MARGIN = 6;
