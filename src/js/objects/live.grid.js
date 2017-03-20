import MiraUIObject from "./base.js";
import * as PIXI from "pixi.js";
import { createHexColors } from "../lib/pixiUiObject.js";
import ActiveFrameStore from "../stores/activeFrame.js";

const DIRECTION_MARGIN = 6;

const CellStyle = Object.freeze({
	CELL : {
		INACTIVE : "INACTIVE",
		ACTIVE : "ACTIVE",
		MARKED : "MARKED",
		DEFAULT : "DEFAULT"
	},
	DIRECTION : {
		LEFT : "LEFT",
		RIGHT : "RIGHT",
		CROSS : "CROSS"
	}
});

class Cell {
	constructor() {
		this._graphics = new PIXI.Graphics();
		this._needsRedraw = false;
		this._cellStyle = undefined;
	}

	set cellStyle(cs) {
		if (this._cellStyle !== cs) {
			this._cellStyle = cs;
			this._needsRedraw = true;
		}
	}

	draw(cellType, row, column, params, mgraphics) {
		this._needsRedraw = false;
		this._graphics.clear();
		if (this._cellStyle === undefined) return;

		const scale = ActiveFrameStore.getScale();
		const {
			width,
			height,
			bgstepcolor,
			bgstepcolor2,
			bordercolor,
			columns,
			direction,
			direction_height,
			directioncolor,
			rows,
			spacing,
			stepcolor
		} = params;
		let { rounded } = params;
		const directionMargin = DIRECTION_MARGIN;
		const buttonWidth = width / columns;
		const buttonHeight = (direction === 1) ? ((height - direction_height - directionMargin ) / rows) : (height / rows);
		rounded = Math.min(rounded, buttonHeight / 2 - 0.5);

		const directionBounds = { width : buttonWidth - 2 * spacing, height : direction_height - 1};

		const i = row;
		const j = column;

		if (cellType === "cell") {
			let x = (j * buttonWidth) + spacing;
			let y = (i * buttonHeight) + spacing;

			switch (this._cellStyle) {
				case CellStyle.CELL.ACTIVE:
					this._graphics.beginFill(createHexColors(stepcolor), stepcolor[3]);
					break;
				case CellStyle.CELL.INACTIVE:
					this._graphics.beginFill(createHexColors([0, 0, 0, 0]), 0);
					break;
				case CellStyle.CELL.MARKED:
					this._graphics.beginFill(createHexColors(bgstepcolor), bgstepcolor[3]);
					break;
				case CellStyle.CELL.DEFAULT:
					this._graphics.beginFill(createHexColors(bgstepcolor2), bgstepcolor2[3]);
					break;
				default:
					this._graphics.beginFill(createHexColors(bgstepcolor2), bgstepcolor2[3]);
					break;
			}

			let cellRect = [
				((j * buttonWidth) + spacing) * scale,
				((i * buttonHeight) + spacing) * scale,
				(buttonWidth - (2 * spacing)) * scale,
				(buttonHeight - (2 * spacing)) * scale
			];
			this._graphics.lineStyle(0.5, createHexColors(bordercolor), bordercolor[3]);
			this._graphics.drawRoundedRect(...cellRect, rounded * scale);
			this._graphics.endFill();

			this._graphics.beginFill(createHexColors([0, 0, 0, 0]), 0);
			this._graphics.lineStyle();
			x -= spacing;
			y -= spacing;
			mgraphics.currentShape = new PIXI.Rectangle(x * scale, y * scale, buttonWidth * scale, buttonHeight * scale);
			this._graphics.drawShape(mgraphics.currentShape);
			mgraphics.add_attribute("col", j);
			mgraphics.add_attribute("row", (rows - i - 1));
			mgraphics.add_attribute("cell_type", "cell");
			this._graphics.endFill();
		} else if (cellType === "direction") {
			let x = (j * buttonWidth) + spacing;
			let y = rows * buttonHeight + directionMargin;
			const padding = 2 * spacing;
			const triangleBase = direction_height - (2 * spacing) - (2 * padding);
			const triangleHeight = buttonWidth - (4 * padding);

			this._graphics.beginFill(createHexColors([0, 0, 0, 0]), 0);
			this._graphics.lineStyle(0.5, createHexColors(bordercolor), bordercolor[3]);
			this._graphics.drawRoundedRect(x * scale, y * scale, directionBounds.width * scale, directionBounds.height * scale, rounded * scale);
			this._graphics.endFill();

			this._graphics.beginFill(createHexColors(directioncolor), directioncolor[3]);

			// Triangle left
			if (this._cellStyle === CellStyle.DIRECTION.LEFT) {
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
			else if (this._cellStyle === CellStyle.DIRECTION.RIGHT) {
				const polyX = x + (2 * padding);
				const polyY = y + padding;
				const points = [[0, triangleBase / 2], [triangleHeight, 0], [triangleHeight, triangleBase]];
				const polygon = new PIXI.Polygon(points.map((point) => {
					return new PIXI.Point((point[0] + polyX) * scale, (point[1] + polyY) * scale);
				}));
				this._graphics.drawShape(polygon);
				this._graphics.endFill();
			}
			// Cross
			else if (this._cellStyle === CellStyle.DIRECTION.CROSS) {
				let startX = (1 / 4) * buttonWidth;
				let startY = (1 / 4) * direction_height;
				this._graphics.lineStyle(2, createHexColors(directioncolor), directioncolor[3]);

				this._graphics.moveTo(((j * buttonWidth) + startX) * scale, (y + startY) * scale);
				this._graphics.lineTo(((j * buttonWidth) + buttonWidth - startX) * scale, (y + direction_height - startY) * scale);
 
				this._graphics.moveTo(((j * buttonWidth) + buttonWidth - startX) * scale, (y + startY) * scale);
				this._graphics.lineTo(((j * buttonWidth) + startX) * scale, (y + direction_height - startY) * scale);
			}

			// Draw a transparent rectangle, then add identifying attrs
			this._graphics.beginFill(createHexColors([0, 0, 0, 0]), 0);
			this._graphics.lineStyle();
			mgraphics.currentShape = new PIXI.Rectangle(x * scale, y * scale, directionBounds.width * scale, directionBounds.height * scale, rounded * scale);
			this._graphics.drawShape(mgraphics.currentShape);
			mgraphics.add_attribute("col", j);
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
		this._dataShapes = null;
		this._allButtonsNeedRedraw = false;
		this._previousParams = null;
		this._currentstepContainer = new PIXI.Graphics();
	}

	_initializeButtons(mgraphics, params) {
		// if cells are drawing themselves
		const {
			columns,
			rows
		} = params;
		this._cells = new Array(rows).fill();
		this._cells = this._cells.map(row => new Array(columns));
		this._directionCells = new Array(columns);
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				this._cells[i][j] = new Cell();
				this._cells[i][j].draw("cell", i, j, params, mgraphics, this);
				this._cellsContainer.addChild(this._cells[i][j]._graphics);
			}
		}

		for (let i = 0; i < columns; i++) {
			this._directionCells[i] = new Cell();
			this._directionCells[i].draw("direction", undefined, i, params, mgraphics);
			this._cellsContainer.addChild(this._directionCells[i]._graphics);
		}

		mgraphics.addDisplayChild(this._cellsContainer);
		this._dataShapes = mgraphics._dataShapes;
	}

	_redrawButtons(mgraphics, params) {
		const {
			columns,
			rows
		} = params;
		// redraw buttons if marked dirty
		for (let i = 0; i < rows; i++) {
			for (let j = 0; j < columns; j++) {
				if (this._cells[i] === undefined) {
					this._cells[i] = new Array(columns);
				}
				if (this._cells[i][j] === undefined) {
					this._cells[i][j] = new Cell();
					this._cells[i][j]._needsRedraw = true;
				}
			}
		}

		for (let i = 0; i < columns; i++) {
			if (this._directionCells[i] === undefined) {
				this._directionCells[i] = new Cell();
				this._directionCells[i]._needsRedraw = true;
			}
		}

		this._updateCellStyles(params);

		for (let j = 0; j < columns; j++) {
			for (let i = 0; i < rows; i++) {
				if (this._cells[i][j]._needsRedraw) {
					this._cells[i][j].draw("cell", i, j, params, mgraphics, this);
				}
			}
			if (this._directionCells[j]._needsRedraw) {
				this._directionCells[j].draw("direction", undefined, j, params, mgraphics);
			}
		}

		// if redrawing all cells, then this._dataShapes = mgraphics._dataShapes;
		if (this._allButtonsNeedRedraw) {
			this._dataShapes = mgraphics._dataShapes;
			this._allButtonsNeedRedraw = false;
		}
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

	_updateCellStyles(params) {
		const {
			columns,
			rows,
			mode,
			distance,
			marker_horizontal,
			marker_vertical
		} = params;
		const inactiveConstraintsCells = distance[3];
		const activeStepCells = distance[4];
		const inactiveValues = distance.slice(5, 5 + inactiveConstraintsCells);
		const stepValues = distance.slice(5 + inactiveConstraintsCells, 5 + inactiveConstraintsCells + activeStepCells);
		const directionValues = distance.slice(5 + inactiveConstraintsCells + activeStepCells);

		let retVal;

		for (let column = 0; column < columns; column++) {
			for (let row = 0; row < rows; row++) {
				let cellValue = (column * 1000) + (rows - row - 1);

				if (mode === "Step Edit") {
					if (inactiveValues.indexOf(cellValue) > -1) {
						retVal = CellStyle.CELL.INACTIVE;
					}
					else if (stepValues.indexOf(cellValue) > -1) {
						retVal = CellStyle.CELL.ACTIVE;
					}
					else if (((rows - row - 1) % marker_vertical === 0) || (column % marker_horizontal === 0)) {
						retVal = CellStyle.CELL.MARKED;
					} else {
						retVal = CellStyle.CELL.DEFAULT;
					}
				}
				else if (mode === "Step constraint") {
					if (inactiveValues.indexOf(cellValue) > -1) {
						retVal = CellStyle.CELL.INACTIVE;
					} else {
						retVal = CellStyle.CELL.ACTIVE;
					}
				}
				this._cells[row][column].cellStyle = retVal;
			}

			if (directionValues[column] === 2) retVal = CellStyle.DIRECTION.LEFT;
			if (directionValues[column] === 0) retVal = CellStyle.DIRECTION.RIGHT;
			if (directionValues[column] === 1) retVal = CellStyle.DIRECTION.CROSS;
			this._directionCells[column].cellStyle = retVal;
		}
	}

	_onParameterChange(stateObj, param) {
		super._onParameterChange(stateObj, param);
		const rows = this._previousParams.rows;
		const columns = this._previousParams.columns;
		if (param.type !== "distance" && param.type !== "varname" && param.type !== "setcell" && param.type !== "directions" && param.type !== "constraint") {
			for (let i = 0; i < rows; i++) {
				for (let j = 0; j < columns; j++) {
					this._cells[i][j]._needsRedraw = true;
				}
			}

			for (let i = 0; i < columns; i++) {
				this._directionCells[i]._needsRedraw = true;
			}
			this._allButtonsNeedRedraw = true;
		} else if (param.type === "distance") {
			const params = {
				marker_horizontal : this._state.getParamValue("marker_horizontal"),
				marker_vertical : this._state.getParamValue("marker_vertical"),
				mode : this._state.getParamValue("mode"),
				columns : this._state.getParamValue("columns"),
				rows : this._state.getParamValue("rows"),
				distance : param.value
			};
			this._updateCellStyles(params);
		}
	}

	paint(mgraphics, params) {
		const {
			currentstep,
			hbgcolor,
			rows,
			columns,
			width,
			height,
			direction,
			direction_height
		} = params;
		this._previousParams = params;
		if (!this._initialized) {
			this._initializeButtons(mgraphics, params);
			this._initialized = true;
			this._displayNode.addDisplayChild(this._cellsContainer);
			this._displayNode.addDisplayChild(this._currentstepContainer);
		}
		this._redrawButtons(mgraphics, params);
		mgraphics._dataShapes = this._dataShapes;

		// currentstep indicator
		const buttonWidth = width / columns;
		const buttonHeight = (direction === 1) ? ((height - direction_height - DIRECTION_MARGIN ) / rows) : (height / rows);
		const scale = ActiveFrameStore.getScale();

		this._currentstepContainer.clear();
		this._currentstepContainer.beginFill(createHexColors(hbgcolor), hbgcolor[3]);
		this._currentstepContainer.drawRect(buttonWidth * (currentstep - 1) * scale, 0, buttonWidth * scale, buttonHeight * rows * scale);
		this._currentstepContainer.endFill();
	}

	pointerDown(event, params) {
		const { distance, rows, mode } = params;
		const { cell_type, col, row } = event.attributes;
		const inactiveConstraintsCells = distance[3];
		const activeStepCells = distance[4];
		const directionValues = distance.slice(5 + inactiveConstraintsCells + activeStepCells);

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
				return (value % 3) - 1;
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
					for (let i = 1; i < steps; i++) {
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
