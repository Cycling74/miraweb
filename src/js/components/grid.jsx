import React from "react";
import classnames from "classnames";
import omit from "lodash/omit.js";

import { capitalize } from "../lib/utils.js";

const BASE_CLASS = "mw-grid";
const SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

export default class Grid extends React.Component {

	render() {
		let gridClass = [
			this.props.size ? `grid-${this.props.size}` : "grid"
		];

		// add sizes
		const sizes = [];
		["Xs", "Sm", "Md", "Lg"].forEach((size) => {
			const sizeVal = this.props[`size${size}`];
			if (sizeVal) sizes.push(`_${size.toLowerCase()}-${sizeVal}`);
		});

		if (sizes && sizes.length) gridClass.push(sizes.join(""));

		// horizontal alignment
		if (this.props.horizAlign !== "left") gridClass.push(this.props.horizAlign);

		// vertical alignment
		if (this.props.vertAlign !== "top") gridClass.push(this.props.vertAlign);

		// distribution
		if (this.props.distribution === "center") {
			gridClass.push("center");
		} else if (this.props.distribution) {
			gridClass.push(`space${capitalize(this.props.distribution)}`);
		}

		// order
		if (this.props.reverse) gridClass.push("reverse");

		// spacing/sizing
		if (this.props.noGutter) gridClass.push("noGutter");
		if (this.props.equalHeight) gridClass.push("equalHeight");
		if (this.props.noBottom) gridClass.push("noBottom");


		gridClass = gridClass.join("-");

		const classes = [
			BASE_CLASS,
			gridClass,
			this.props.className
		];

		const props = omit(this.props,
			"distribution",
			"equalHeight",
			"horizAlign",
			"noBottom",
			"noGutter",
			"reverse",
			"size",
			"sizeXs",
			"sizeSm",
			"sizeMd",
			"sizeLg",
			"tagName",
			"vertAlign"
		);

		return (
			<this.props.tagName { ...props } className={ classnames(classes) } >
				{ this.props.children }
			</this.props.tagName>
		);
	}
}

Grid.propTypes = {
	distribution : React.PropTypes.oneOf(["between", "around", "center"]),
	equalHeight : React.PropTypes.bool,
	horizAlign : React.PropTypes.oneOf(["left", "center", "right"]),
	noBottom : React.PropTypes.bool,
	noGutter : React.PropTypes.bool,
	reverse : React.PropTypes.bool,
	size : React.PropTypes.oneOf(SIZES),
	sizeXs : React.PropTypes.oneOf(SIZES),
	sizeSm : React.PropTypes.oneOf(SIZES),
	sizeMd : React.PropTypes.oneOf(SIZES),
	sizeLg : React.PropTypes.oneOf(SIZES),
	tagName : React.PropTypes.string,
	vertAlign : React.PropTypes.oneOf(["top", "middle", "bottom"])
};

Grid.defaultProps = {
	equalHeight : false,
	horizAlign : "left",
	noBottom : false,
	noGutter : false,
	reverse : false,
	tagName : "div",
	vertAlign : "top"
};
