import classnames from "classnames";
import React from "react";

const BASE_CLASS = "mw-form-field";
const LABEL_CLASS = `${BASE_CLASS}--label`;

export default class FormField extends React.Component {

	render() {

		const classes = [
			BASE_CLASS,
			this.props.className
		];

		const label = this.props.label ? <label className={ LABEL_CLASS } htmlFor={ this.props.htmlFor } >{ this.props.label }</label>  : null;

		return (
			<div { ...this.props } className={ classnames(classes) } >
				{ label }
				{ this.props.children }
			</div>
		);
	}
}

FormField.propTypes = {
	htmlFor : React.PropTypes.string,
	label : React.PropTypes.string
};
