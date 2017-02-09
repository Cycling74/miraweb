import React from "react";
import classnames from "classnames";

const BASE_CLASS = "mw-input";

export default class Input extends React.Component {

	render() {
		const classes = [
			BASE_CLASS,
			this.props.className
		];

		return <input { ...this.props } className={ classnames(classes) } />;
	}
}
