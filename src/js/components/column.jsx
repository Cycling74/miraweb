import React from "react";
import classnames from "classnames";
import omit from "lodash/omit";

const SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
const BASE_CLASS = "mw-column";

export default class Column extends React.Component {

	render() {
		let columnClass = [
			this.props.size ? `col-${this.props.size}` : "col"
		];

		// add sizes
		const sizes = [];
		["Xs", "Sm", "Md", "Lg"].forEach((size) => {
			const sizeVal = this.props[`size${size}`];
			if (sizeVal) sizes.push(`_${size.toLowerCase()}-${sizeVal}`);
		});

		if (this.props.position) columnClass.push(`col-${this.props.position}`);

		columnClass = columnClass.join("-");

		const classes = [
			BASE_CLASS,
			columnClass,
			this.props.className
		];

		const props = omit(this.props,
			"position",
			"size",
			"sizeXs",
			"sizeSm",
			"sizeMd",
			"sizeLg",
			"tagName"
		);

		return (
			<this.props.tagName { ...props } className={ classnames(classes) } >
				{ this.props.children }
			</this.props.tagName>
		);
	}
}

Column.propTypes = {
	position : React.PropTypes.oneOf(["first", "last"]),
	size : React.PropTypes.oneOf(SIZES),
	sizeXs : React.PropTypes.oneOf(SIZES),
	sizeSm : React.PropTypes.oneOf(SIZES),
	sizeMd : React.PropTypes.oneOf(SIZES),
	sizeLg : React.PropTypes.oneOf(SIZES),
	tagName : React.PropTypes.string
};

Column.defaultProps = {
	tagName : "div"
};
