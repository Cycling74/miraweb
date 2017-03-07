import React from "react";
import classnames from "classnames";

const BASE_CLASS = "mw-close";

export default class CloseButton extends React.Component {

	render() {

		const classes = [
			BASE_CLASS,
			this.props.className
		];

		return <button { ...this.props } className={ classnames(classes) }>x</button>
	}
}
