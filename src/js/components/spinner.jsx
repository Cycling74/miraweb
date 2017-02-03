import React from "react";
import classnames from "classnames";

const BASE_CLASS = "mw-spinner";

export default class Spinner extends React.Component {

	render() {
		const classes = [
			BASE_CLASS,
			this.props.className
		];

		const style = { backgroundColor: this.props.color };

		return <div className={ classnames(classes) } >
			<div className="sk-child sk-bounce1" style={ style } />
			<div className="sk-child sk-bounce2" style={ style } />
			<div className="sk-child sk-bounce3" style={ style } />
		</div>;
	}
}

Spinner.defaultProps = {
	color : "#fff"
};
