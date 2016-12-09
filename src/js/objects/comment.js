import MiraUIObject from "./base.js";

export default class Comment extends MiraUIObject {

	constructor(stateObj) {
		super(stateObj);
	}

	paint(mgraphics, params) {
		const {
			textfield,
			fontsize,
			textjustification,
			fontname,
			fontface,
			bgcolor,
			textcolor,
			bubble,
			bubblepoint,
			bubbleside,
			bubbletextmargin,
			width,
			height
		} = params;
		const PADDING_LEFT = 4.25;
		let PADDING_TOP = 0;
		let textRect;
		if (bubble) {
			// needed for all cases of bubble comments
			const BORDER_OFFSET = 1;
			const TRIANGLE_HEIGHT = 15;
			const MIN_TRIANGLE_WIDTH = 0.5;
			const MAX_TRIANGLE_WIDTH = 7.5;
			const STROKE_COLOR = [0.75, 0.75, 0.75, 1.0];
			const STROKE_WIDTH = 0.8;
			const TRIANGLE_MARGIN = 10;
			let borderRadius;
			if ((bubbleside === "Left" || bubbleside === "Right") && height < 31) {
				borderRadius = (height / 2) - 1;
			} else if ((bubbleside === "Top" || bubbleside === "Bottom") && height < 46) {
				borderRadius = ((height - TRIANGLE_HEIGHT) / 2) - 1;
			} else {
				borderRadius = 15;
			}

			let triangleWidth;
			let triangleSide;
			let trianglePosition;
			let triangleTipPosition;
			if (bubbleside === "Left" || bubbleside === "Right") {
				triangleSide = height;
			} else {
				triangleSide = width;
			}
			if (triangleSide < 2 * TRIANGLE_MARGIN) {
				triangleWidth = MIN_TRIANGLE_WIDTH;
			} else if (triangleSide > (2 * TRIANGLE_MARGIN + 2 * MAX_TRIANGLE_WIDTH)) {
				triangleWidth = MAX_TRIANGLE_WIDTH;
			} else {
				triangleWidth = (triangleSide - 2 * TRIANGLE_MARGIN) / 2;
			}

			if (triangleSide < (2 * TRIANGLE_MARGIN + 2 * MAX_TRIANGLE_WIDTH)) {
				trianglePosition = triangleSide / 2;
			} else {
				trianglePosition = 19 + bubblepoint * (triangleSide - 2 * 19);
			}

			triangleTipPosition = trianglePosition + 20 * (bubblepoint - 0.5);

			if (bubbleside === "Left") {
				// Rounded Rectangle
				mgraphics.set_source_gradient(
					[[1.0, 1.0, 1.0, 1.0], [0.9, 0.9, 0.9, 1.0]],
					[0.5, 0.9],
					[0.5, 1.0],
					0.5
				);
				mgraphics.rectangle(
					TRIANGLE_HEIGHT,
					BORDER_OFFSET,
					width - TRIANGLE_HEIGHT - BORDER_OFFSET,
					height - 2 * BORDER_OFFSET,
					borderRadius
				);
				mgraphics.fill();
				mgraphics.set_source_rgba(STROKE_COLOR);
				mgraphics.set_line_width(STROKE_WIDTH);
				mgraphics.stroke();

				// Triangle
				mgraphics.set_source_rgba([1.0, 1.0, 1.0, 1.0]);
				mgraphics.polygon(0, 0,
					[
						[TRIANGLE_HEIGHT + 0.5, trianglePosition - triangleWidth],
						[0, triangleTipPosition],
						[TRIANGLE_HEIGHT + 0.5, trianglePosition + triangleWidth]
					]
				);
				mgraphics.fill();

				mgraphics.set_source_rgba(STROKE_COLOR);
				mgraphics.set_line_width(STROKE_WIDTH);

				// FOR OLDER PIXI
				mgraphics.move_to(TRIANGLE_HEIGHT + 0.5, trianglePosition - triangleWidth);
				mgraphics.line_to(0, triangleTipPosition);
				mgraphics.stroke();
				mgraphics.move_to(0, triangleTipPosition);
				mgraphics.line_to(TRIANGLE_HEIGHT + 0.5, trianglePosition + triangleWidth);
				mgraphics.stroke();


				// FOR NEWER PIXI
				// mgraphics.stroke();

				// Text
				textRect = [bubbletextmargin + TRIANGLE_HEIGHT, PADDING_TOP + bubbletextmargin, width - TRIANGLE_HEIGHT - (2 * bubbletextmargin), height - 2 * (PADDING_TOP + bubbletextmargin)];
			} else if (bubbleside === "Right") {
				// Rounded Rectangle
				mgraphics.set_source_gradient(
					[[1.0, 1.0, 1.0, 1.0], [0.9, 0.9, 0.9, 1.0]],
					[0.5, 0.9],
					[0.5, 1.0],
					0.5
				);
				mgraphics.rectangle(
					BORDER_OFFSET,
					BORDER_OFFSET,
					width - TRIANGLE_HEIGHT - BORDER_OFFSET,
					height - 2 * BORDER_OFFSET,
					borderRadius
				);
				mgraphics.fill();
				mgraphics.set_source_rgba(STROKE_COLOR);
				mgraphics.set_line_width(STROKE_WIDTH);
				mgraphics.stroke();

				// Triangle
				mgraphics.set_source_rgba([1.0, 1.0, 1.0, 1.0]);
				mgraphics.polygon(0, 0,
					[
						[width - (TRIANGLE_HEIGHT + 0.5), trianglePosition - triangleWidth],
						[width, triangleTipPosition],
						[width - (TRIANGLE_HEIGHT + 0.5), trianglePosition + triangleWidth]
					]
				);
				mgraphics.fill();

				mgraphics.set_source_rgba(STROKE_COLOR);
				mgraphics.set_line_width(STROKE_WIDTH);

				// FOR OLDER PIXI
				mgraphics.move_to(width - (TRIANGLE_HEIGHT + 0.5), trianglePosition - triangleWidth);
				mgraphics.line_to(width, triangleTipPosition);
				mgraphics.stroke();
				mgraphics.move_to(width, triangleTipPosition);
				mgraphics.line_to(width - (TRIANGLE_HEIGHT + 0.5), trianglePosition + triangleWidth);
				mgraphics.stroke();

				// FOR Newer PIXI
				// mgraphics.stroke();

				textRect = [bubbletextmargin, PADDING_TOP + bubbletextmargin, width - TRIANGLE_HEIGHT - (2 * bubbletextmargin), height - 2 * (PADDING_TOP + bubbletextmargin)];
			} else if (bubbleside === "Bottom") {
				// Rounded Rectangle
				mgraphics.set_source_rgba([1.0, 1.0, 1.0, 1.0]);
				mgraphics.rectangle(
					BORDER_OFFSET,
					BORDER_OFFSET,
					width - 2 * BORDER_OFFSET,
					height - TRIANGLE_HEIGHT - BORDER_OFFSET,
					borderRadius
				);
				mgraphics.fill();
				mgraphics.set_source_rgba(STROKE_COLOR);
				mgraphics.set_line_width(STROKE_WIDTH);
				mgraphics.stroke();

				// Triangle
				mgraphics.set_source_gradient(
					[[1.0, 1.0, 1.0, 1.0], [0.9, 0.9, 0.9, 1.0]],
					[0.5, 0],
					[0.5, 1.0],
					0.5
				);
				mgraphics.polygon(0, 0,
					[
						[trianglePosition - triangleWidth, height - (TRIANGLE_HEIGHT + 0.5)],
						[triangleTipPosition, height],
						[trianglePosition + triangleWidth, height - (TRIANGLE_HEIGHT + 0.5)]
					]
				);
				mgraphics.fill();

				mgraphics.set_source_rgba(STROKE_COLOR);
				mgraphics.set_line_width(STROKE_WIDTH);

				// FOR OLDER PIXI
				mgraphics.move_to(trianglePosition - triangleWidth, height - (TRIANGLE_HEIGHT + 0.5));
				mgraphics.line_to(triangleTipPosition, height);
				mgraphics.stroke();
				mgraphics.move_to(triangleTipPosition, height);
				mgraphics.line_to(trianglePosition + triangleWidth, height - (TRIANGLE_HEIGHT + 0.5));
				mgraphics.stroke();

				// FOR Newer PIXI
				// mgraphics.stroke();

				textRect = [bubbletextmargin, PADDING_TOP + bubbletextmargin, width - (2 * bubbletextmargin), height - TRIANGLE_HEIGHT - 2 * (PADDING_TOP + bubbletextmargin)];
			} else { // Top
				// Rounded Rectangle
				mgraphics.set_source_gradient(
					[[1.0, 1.0, 1.0, 1.0], [0.9, 0.9, 0.9, 1.0]],
					[0.5, 0.9],
					[0.5, 1.0],
					0.5
				);
				mgraphics.rectangle(
					BORDER_OFFSET,
					TRIANGLE_HEIGHT,
					width - 2 * BORDER_OFFSET,
					height - TRIANGLE_HEIGHT - BORDER_OFFSET,
					borderRadius
				);
				mgraphics.fill();
				mgraphics.set_source_rgba(STROKE_COLOR);
				mgraphics.set_line_width(STROKE_WIDTH);
				mgraphics.stroke();

				// Triangle
				mgraphics.set_source_rgba([1.0, 1.0, 1.0, 1.0]);
				mgraphics.polygon(0, 0,
					[
						[trianglePosition - triangleWidth, TRIANGLE_HEIGHT + 0.5],
						[triangleTipPosition, 0],
						[trianglePosition + triangleWidth, TRIANGLE_HEIGHT + 0.5]
					]
				);
				mgraphics.fill();

				mgraphics.set_source_rgba(STROKE_COLOR);
				mgraphics.set_line_width(STROKE_WIDTH);

				// FOR OLDER PIXI
				mgraphics.move_to(trianglePosition - triangleWidth, TRIANGLE_HEIGHT + 0.5);
				mgraphics.line_to(triangleTipPosition, 0);
				mgraphics.stroke();
				mgraphics.move_to(triangleTipPosition, 0);
				mgraphics.line_to(trianglePosition + triangleWidth, TRIANGLE_HEIGHT + 0.5);
				mgraphics.stroke();

				// FOR Newer PIXI
				// mgraphics.stroke();

				textRect = [bubbletextmargin, PADDING_TOP + TRIANGLE_HEIGHT + bubbletextmargin, width - (2 * bubbletextmargin), height - TRIANGLE_HEIGHT - 2 * (PADDING_TOP + bubbletextmargin)];
			}

		} else {
			PADDING_TOP = 3;
			// Regular Comment
			mgraphics.set_source_rgba(bgcolor);
			mgraphics.rectangle(0, 0, width, height);
			mgraphics.fill();

			textRect = [PADDING_LEFT, PADDING_TOP, width - (2 * PADDING_LEFT), height - PADDING_TOP];
		}

		// Regardless, draw the text
		if (!this.cachedText) {
			mgraphics.set_font_name(fontname);
			mgraphics.set_font_weight(fontface);
			mgraphics.set_font_size(fontsize);
			mgraphics.set_font_justification(textjustification);
			mgraphics.set_source_rgba(textcolor);
			this.cachedText = mgraphics.text(...textRect, textfield);
		} else {
			this.displayElement.addChild(this.cachedText);
		}
	}
}

Comment.NAME = "comment";
