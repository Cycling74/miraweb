import MiraUIObject from "./base.js";

export default class Panel extends MiraUIObject {
	constructor(stateObj) {
		super(stateObj);
	}

	_setBackgroundColor(mgraphics, params) {

		const {
			bgfillcolor_color,
			bgfillcolor_type,
			bgfillcolor_pt1,
			bgfillcolor_pt2,
			bgfillcolor_color1,
			bgfillcolor_color2,
			bgfillcolor_proportion,
			bgfillcolor_angle
		} = params;

		if (bgfillcolor_type === "gradient") {
			mgraphics.set_source_gradient(
				[ bgfillcolor_color1, bgfillcolor_color2 ],
				bgfillcolor_pt1,
				bgfillcolor_pt2,
				bgfillcolor_proportion,
				bgfillcolor_angle
			);
		} else {
			mgraphics.set_source_rgba(bgfillcolor_color);
		}
	}

	paint(mgraphics, params) {
		const {
			width,
			height,
			bordercolor,
			border,
			rounded,
			shape,
			horizontal_direction,
			vertical_direction,
			arrow_orientation
		} = params;

		const half_border = border * 0.5;

		if (shape === "Rectangle") {			// rectangle
			this._setBackgroundColor(mgraphics, params);
			mgraphics.set_line_width(border);
			mgraphics.rectangle(border * 0.5, border * 0.5, width - border, height - border, rounded * 0.5);
			mgraphics.fill();
			mgraphics.set_source_rgba(bordercolor);
			mgraphics.stroke();
		} else if (shape === "Circle") {	// circle
			this._setBackgroundColor(mgraphics, params);
			mgraphics.set_line_width(border);
			mgraphics.ellipse(width * 0.5, height * 0.5, (width - border) * 0.5, (height - border) * 0.5);
			mgraphics.fill();
			mgraphics.set_source_rgba(bordercolor);
			mgraphics.stroke();
		} else if (shape === "Triangle") {	// triangle
			mgraphics.set_line_width(border);
			if (horizontal_direction === "Left to Right") {
				if (vertical_direction === "Top to Bottom")
					{mgraphics.polygon(0.0, 0.0, [[border * 0.5, border * 0.5], [width - border * 0.5, height - border * 0.5], [border * 0.5, height - border * 0.5]]);}
				else if (vertical_direction === "Center")
					{mgraphics.polygon(0.0, 0.0, [[border * 0.5, border * 0.5], [width - border * 0.5, height * 0.5], [border * 0.5, height - border * 0.5]]);}
				else
					{mgraphics.polygon(0.0, 0.0, [[border * 0.5, border * 0.5], [width - border * 0.5, border * 0.5], [border * 0.5, height - border * 0.5]]);}
			} else {
				if (vertical_direction === "Top to Bottom")
					{mgraphics.polygon(0.0, 0.0, [[border * 0.5, height - border * 0.5], [width - border * 0.5, border * 0.5], [width - border * 0.5, height - border * 0.5]]);}
				else if (vertical_direction === "Center")
					{mgraphics.polygon(0.0, 0.0, [[border * 0.5, height * 0.5], [width - border * 0.5, border * 0.5], [width - border * 0.5, height - border * 0.5]]);}
				else
					{mgraphics.polygon(0.0, 0.0, [[border * 0.5, border * 0.5], [width - border * 0.5, border * 0.5], [width - border * 0.5, height - border * 0.5]]);}
			}

			this._setBackgroundColor(mgraphics, params);
			mgraphics.fill();
			mgraphics.set_source_rgba(bordercolor);
			mgraphics.stroke();
		} else if (shape === "Arrow") {	// arrow
			mgraphics.set_line_width(border);
			if (arrow_orientation === "Left to Right") {
				mgraphics.polygon(0, 0, [ [ half_border, height / 3.0], [ width * 2.0 / 3.0, height / 3.0], [ width * 2.0 / 3.0,  half_border], [ width - half_border, height / 2.0], [ width * 2.0 / 3.0, height - half_border], [ width * 2.0 / 3.0, height * 2.0 / 3.0], [ half_border, height * 2.0 / 3.0] ]);
			} else if (arrow_orientation === "Right to Left") {
				mgraphics.polygon(0, 0, [ [ width - half_border, height / 3.0], [ width - half_border, height * 2.0 / 3.0], [ width / 3.0, height * 2.0 / 3.0], [ width / 3.0, height - half_border], [ half_border, height / 2.0], [ width / 3.0, half_border], [ width / 3.0, height / 3.0] ]);
			} else if (arrow_orientation === "Top to Bottom") {
				mgraphics.polygon(0, 0, [ [ width / 3.0, half_border], [ width * 2.0 / 3.0, half_border], [ width * 2.0 / 3.0, height * 2.0 / 3.0], [ width - half_border, height * 2.0 / 3.0], [ width / 2.0, height - half_border], [ half_border, height * 2.0 / 3.0], [ width / 3.0, height * 2 / 3.0] ]);
			} else if (arrow_orientation === "Bottom to Top") {
				mgraphics.polygon(0, 0, [ [ width / 3.0, height - half_border], [ width / 3.0, height / 3.0], [ half_border, height / 3.0], [ width / 2.0, half_border], [ width - half_border, height / 3.0], [ width * 2.0 / 3.0, height / 3.0], [ width * 2.0 / 3.0, height - half_border] ]);
			}
			this._setBackgroundColor(mgraphics, params);
			mgraphics.fill();
			mgraphics.set_source_rgba(bordercolor);
			mgraphics.stroke();
		}
	}

	pointerDown(event, params) {
		const { value } = params;
		this.setParamValue("value", ((value === 1) ? 0 : 1));
	}
}

Panel.NAME = "panel";
