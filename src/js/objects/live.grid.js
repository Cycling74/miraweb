import MiraUIObject from "./base.js";
import * as PIXI from "pixi.js";
import { createHexColors } from '../lib/pixiUiObject.js';
import ActiveFrameStore from "../stores/activeFrame.js";

const DIRECTION_MARGIN = 6;

class Cell {
	constructor() {
		this._graphics = new PIXI.Graphics();
		this._needsRedraw = false;
	}

	draw(cellType, row, column, params, mgraphcs, liveGrid) {
		this._needsRedraw = false;
		const scale = ActiveFrameStore.getScale();
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
		const directionMargin = DIRECTION_MARGIN;
		const buttonWidth = width / columns;
		const buttonHeight = (direction === 1) ? ((height - direction_height - directionMargin ) / rows) : (height / rows);
		rounded = Math.min(rounded, buttonHeight / 2 - 0.5);

		const inactiveConstraintsCells = distance[3];
		const activeStepCells = distance[4];
		const inactiveValues = distance.slice(5, 5 + inactiveConstraintsCells);
		const stepValues = distance.slice(5 + inactiveConstraintsCells, 5 + inactiveConstraintsCells + activeStepCells);
		const directionValues = distance.slice(5 + inactiveConstraintsCells + activeStepCells);

		const directionBounds = { width : buttonWidth - 2 * spacing, height : direction_height - 1};

		const i = row;
		const j = column;

		if (cellType === "cell") {
			let x = (j * buttonWidth) + spacing;
			let y = (i * buttonHeight) + spacing;
			let cellValue = (j * 1000) + (rows - i - 1);

			if (mode === "Step Edit") {
				if (inactiveValues.indexOf(cellValue) > -1) {
					this._graphics.beginFill(createHexColors([0, 0, 0, 0]), 0);
				}
				else if (stepValues.indexOf(cellValue) > -1) {
					this._graphics.beginFill(createHexColors(stepcolor), stepcolor[3]);
				}
				else if (((i + 1) % marker_vertical === 0) || (j % marker_horizontal === 0)) {
					this._graphics.beginFill(createHexColors(bgstepcolor), bgstepcolor[3]);
				} else {
					this._graphics.beginFill(createHexColors(bgstepcolor2), bgstepcolor2[3]);
				}
			}
			else if (mode === "Step constraint") {
				if (inactiveValues.indexOf(cellValue) > -1) {
					this._graphics.beginFill(createHexColors([0, 0, 0, 0]), 0);
				} else {
					this._graphics.beginFill(createHexColors(stepcolor), stepcolor[3]);
				}
			}

			let cellRect = [
				((j * buttonWidth) + spacing) * scale,
				((i * buttonHeight) + spacing) * scale,
				(buttonWidth - (2 * spacing)) * scale,
				(buttonHeight - (2 * spacing)) * scale
			];
			this._graphics.lineStyle(0.5, createHexColors(bordercolor), bordercolor[3]);
			this._graphics.drawRoundedRectangle(...cellRect, rounded*scale);
			this._graphics.endFill();

			this._graphics.beginFill(createHexColors([0, 0, 0, 0]), 0);
			this._graphics.lineStyle();
			x -= spacing;
			y -= spacing;
			liveGrid.currentShape = new PIXI.Rectangle(x*scale, y*scale, buttonWidth*scale, buttonHeight*scale);
			this._graphics.drawShape(liveGrid.currentShape);
			mgraphics.add_attribute("col", j);
			mgraphics.add_attribute("row", (rows - i - 1));
			mgraphics.add_attribute("cell_type", "cell");
			this._graphics.endFill();
		} else if (cellType === "direction") {
			let i = j; //this is a terrible hack, deepest of apologies.

			let x = (i * buttonWidth) + spacing;
			let y = rows * buttonHeight + directionMargin;
			const padding = 2 * spacing;
			const triangleBase = direction_height - (2 * spacing) - (2 * padding);
			const triangleHeight = buttonWidth - (4 * padding);

			this._graphics.beginFill(createHexColors([0, 0, 0, 0]), 0);
			this._graphics.lineStyle(0.5, createHexColors(bordercolor), bordercolor[3]);
			this._graphics.drawRoundedRectangle(x, y, directionBounds.width, directionBounds.height, rounded);
			this._graphics.endFill();

			this._graphics.beginFill(createHexColors(directioncolor), directioncolor[3]);

			// Triangle left
			if (directionValues[i] === 2) {
				const polyX = x + (2 * padding);
				const polyY = y + padding;
				const points = [[0, 0], [0, triangleBase], [triangleHeight, triangleBase / 2]];
				const polygon = new PIXI.Polygon(points.map((point) => {
					return new PIXI.Point((point[0] + polyX) * scale, (point[1] + polyY) * scale);
				}));
				this._graphics.drawShape(polygon);
				this._graphics.endFill();
			}
			// Triangle right
			else if (directionValues[i] === 0) {
				const polyX = x + (2 * padding);
				const polyY = y + padding;
				const points = [[0, triangleBase / 2], [triangleHeight, 0], [triangleHeight, triangleBase]]
				const polygon = new PIXI.Polygon(points.map((point) => {
					return new PIXI.Point((point[0] + polyX) * scale, (point[1] + polyY) * scale);
				}));
				this._graphics.drawShape(polygon);
				this._graphics.endFill();
			}
			// Cross
			else if (directionValues[i] === 1) {
				let startX = (1 / 4) * buttonWidth;
				let startY = (1 / 4) * direction_height;
				this._graphics.lineStyle(2, createHexColors(directioncolor), directioncolor[3]);

				this._graphics.moveTo(((i * buttonWidth) + startX) * scale, (y + startY) * scale);
				this._graphics.lineTo(((i * buttonWidth) + buttonWidth - startX)*scale, (y + direction_height - startY)*scale);

				this._graphics.moveTo(((i * buttonWidth) + buttonWidth - startX)*scale, (y + startY)*scale);
				this._graphics.lineTo(((i * buttonWidth) + startX)*scale, (y + direction_height - startY)*scale);
			}

			// Draw a transparent rectangle, then add identifying attrs
			this._graphics.beginFill(createHexColors([0, 0, 0, 0]), 0);
			this._graphics.lineStyle();
			liveGrid.currentShape = new PIXI.Rectangle(x*scale, y*scale, directionBounds.width*scale, directionBounds.height*scale, rounded*scale);
			this._graphics.drawShape(liveGrid.currentShape);
			mgraphics.add_attribute("col", i);
			mgraphics.add_attribute("cell_type", "direction");
			this._graphics.endFill();
		}
	}
}

export default class LiveGrid extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
		this._typeForTouch = {};
		this._lastPositionForTouch = {};
		this._currentDragValue = 0;
		this._cellsContainer = new PIXI.Container();
		this._cells = null;
		this._directionCells = null;
		this._initialized = false;
		//some function which creates all of the button graphics instances
	}

	_initializeButtons(mgraphics, params) {
		//if cells are drawing themselves
		const {
			columns,
			rows
		} = params;
		this._cells = new Array(rows).fill();
		this._cells = this._cells.map(row => new Array(columns));
		this._directionCells = new Array(columns);
		for (var i = 0; i < rows; i++) {
			for(var j = 0; j < columns; j++) {
				this._cells[i][j] = new Cell();
				this._cells[i][j].draw("cell", i, j, params, mgraphics, this);
				this._cellsContainer.addChild(this._cells[i][j]);
			}
		}

		for (var i = 0; i < columns; i++) {
			this._directionCells = new Cell();
			this._directionCells[i].draw("direction", undefined, i, params, mgraphics, this);
			this._cellsContainer.addChild(this._directionCells[i]);
		}

		mgraphics.addChild(this._cellsContainer);
	}

	_redrawButtons(mgraphics, params) {
	}

	_isCellInactive(row, col, distance) {
		const inactiveConstraintsCells = distance[3];
		const inactiveValues = distance.slice(5, 5 + inactiveConstraintsCells);
		const cellValue = (col * 1000) + row;
		const cellIsInactive = inactiveValues.find(value => value === cellValue);
		if (cellIsInactive === undefined) {
			return false;
		}
		return true;
	}

	_setConstraint(row, col, distance, rows) {
		const inactiveConstraintsCells = distance[3];
		const inactiveValues = distance.slice(5, 5 + inactiveConstraintsCells);
		// get all values that are inactive in the current column
		let inactiveValuesInColumn = inactiveValues.filter((value) => {
			if (Math.floor(value / 1000) === col) {
				return true;
			}
			return false;
		});
		inactiveValuesInColumn = inactiveValuesInColumn.map((value) => {
			return value % 1000;
		});

		// now we have the positions of all cells in the column that are inactive
		const constraint = new Array(rows + 1).fill(1);
		constraint[0] = col + 1;
		inactiveValuesInColumn.forEach((value) => {
			constraint[value + 1] = 0;
		});
		constraint[row + 1] = this._currentDragValue;
		this.setParamValue("constraint", constraint);		
	}

	_onParameterChange(stateObj, param) {
		super._onParameterChange(stateObj, param);
		if (!param.type === "distance") {
			//make all buttons render again
		}
	}

	paint(mgraphics, params) {
		if (!this._initialized) {
			this._initializeButtons(mgraphics, params);
			this._initialized = true;
			this._displayNode.addDisplayChild(this._buttonContainer);
		}
		this._redrawButtons(mgraphics, params);
	}

	pointerDown(event, params) {
		const { distance, rows, mode } = params;
		const { cell_type, col, row } = event.attributes;
		const inactiveConstraintsCells = distance[3];
		const activeStepCells = distance[4];
		const inactiveValues = distance.slice(5, 5 + inactiveConstraintsCells);
		const stepValues = distance.slice(5 + inactiveConstraintsCells, 5 + inactiveConstraintsCells + activeStepCells);
		const directionValues = distance.slice(5 + inactiveConstraintsCells + activeStepCells);

		const cellValue = (col * 1000) + row;

		this._typeForTouch[ event.id ] = cell_type;

		if (cell_type === "cell") {
			if (mode === "Step constraint") {
				if (this._isCellInactive(row, col, distance)) {
					this._currentDragValue = 1;
				} else {
					this._currentDragValue = 0;
				}
				this._setConstraint(row, col, distance, rows);
			} else {
				this.setParamValue("setcell", [col + 1, row + 1, 1]);
			}
			this._lastPositionForTouch[ event.id ] = { col, row };
		} else if (cell_type === "direction") {
			const newDirections = directionValues.map((value, index) => {
				if (index === col) {
					// CAT - okay, so. To set a direction value, you have to set it to one less
					// that the value that it returns. e.g.
					// set -1 => returns 0
					// set 0 => returns 1
					// set 1 => returns 2
					// thus, the reason for this very strange line of code. 
					return ((value + 1) % 3) - 1;
				}
				return value;
			});
			this.setParamValue("directions", newDirections);
		}
	}

	pointerMove(event, params) {
		const touchType = this._typeForTouch[ event.id ];
		const lastPosition = this._lastPositionForTouch[ event.id ];
		const { rows, mode, distance } = params;
		const { cell_type, col, row } = event.attributes;

		if (touchType === "cell" && cell_type === "cell") {
			if (lastPosition.col !== col || lastPosition.row !== row) {
				if (mode === "Step constraint") {
					const cellInactive = this._isCellInactive(row, col, distance);
					if (cellInactive && this._currentDragValue === 1
						|| !cellInactive && this._currentDragValue === 0) {
						this._setConstraint(row, col, distance, rows);
					}
				} else {
					this.setParamValue("setcell", [Math.round(col + 1), Math.round(row + 1), 1]);
				}
				const steps = Math.abs(lastPosition.col - col);
				const stepInc = lastPosition.col > col ? -1 : 1;
				const valInc = (row - lastPosition.row) / steps;
				if (steps > 1) {
					for (let i = i; i < steps; i++) {
						const newCol = lastPosition.col + stepInc * i;
						const newRow = lastPosition.row + valInc * i;
						if (mode === "Step constraint") {
							this._setConstraint(newRow, newCol, distance, rows);
						} else {
							this.setParamValue("setcell", [Math.round(newCol + 1), Math.round(newRow + 1), 1]);
						}

					}
				}

				this._lastPositionForTouch[ event.id ] = { col, row };
			}
		}
	}

	pointerUp(event, params) {
		delete this._typeForTouch[ event.id ];
	}
}

LiveGrid.NAME = "live.grid";
