import React from "react";
import classnames from "classnames";
import omit from "lodash/omit.js";

const BASE_CLASS = "mw-info-text";

export default class InfoText extends React.Component {

	render() {
		const classes = classnames([
			BASE_CLASS,
			this.props.className,
			{
				[`${BASE_CLASS}--${this.props.type}`] : this.props.type !== "info"
			}
		]);

		const props = omit(this.props, "type");

		return (
			<p { ...props } className={ classes } >
				{ this.props.children }
			</p>
		);
	}
}

InfoText.propTypes = {
	type : React.PropTypes.oneOf(["error", "info", "success", "warn"])
};

InfoText.defaultProps = {
	type : "info"
};
