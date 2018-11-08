import React from "react";
import PropTypes from "prop-types";
import classnames from "classnames";
import omit from "lodash/omit.js";

import CloseButton from "./closeButton.jsx";

const BASE_CLASS = "mw-dialog";

export default class Dialog extends React.Component {

	_onPreventClose(e) {
		e.stopPropagation();
	}

	render() {
		if (!this.props.show) return null;

		const classes = classnames([
			BASE_CLASS,
			this.props.className
		]);

		const props = omit(this.props,
			"closable",
			"onClose",
			"show",
			"title"
		);

		return (
			<div { ...props } className={ classes }  >
				<div className={ `${BASE_CLASS}-content` } onClick={ this._onPreventClose.bind(this) } >
					<div className={ `${BASE_CLASS}-title-wrapper` } >
						<h2 className={ `${BASE_CLASS}-title` }>{ this.props.title}</h2>
						{ this.props.closable ? <CloseButton onClick={ this.props.onClose } /> : null }
					</div>
					{ this.props.children }
				</div>
			</div>
		);
	}
}

Dialog.propTypes = {
	onClose : PropTypes.func,
	closable : PropTypes.bool,
	show : PropTypes.bool,
	title : PropTypes.string.isRequired
};

Dialog.defaultProps = {
	closable : true,
	show : false
};
