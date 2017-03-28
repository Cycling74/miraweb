import React from "react";
import classnames from "classnames";

const BASE_CLASS = "mw-select";

export default class Select extends React.Component {

	render() {
		const classes = [
			BASE_CLASS,
			this.props.className
		];

		return (
			<select { ...this.props } className={ classnames(classes) } >
				{ this.props.children }
				</select>
		);
	}
}
