import React from "react";
import ChromePicker from "react-color/lib/components/chrome/Chrome.js";
import tinycolor from "tinycolor2";
import classnames from "classnames";

const BASE_CLASS = "mw-color-changer";

export default class ColorChanger extends React.Component {

	constructor(props) {
		super(props);

		this.state = {
			show : false,
			color : this._parseRatioColor(props.color)
		};
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			color : this._parseRatioColor(nextProps.color)
		});
	}

	_parseRatioColor(color) {
		return tinycolor.fromRatio({
			r : color[0],
			g : color[1],
			b : color[2]
		});
	}

	_onToggleDisplay() {
		this.setState({ show : !this.state.show });
	}

	_onClose() {
		this.setState({ show : false });
	}

	_onColorChange(newColor) {
		const ratioColor = [
			newColor.rgb.r / 255,
			newColor.rgb.g / 255,
			newColor.rgb.b / 255,
			1
		];
		this.props.onChangeColor(ratioColor);
	}

	_renderPicker() {
		if (!this.state.show) return null;

		return (
			<div className={ `${BASE_CLASS}-popover` } >
				<div className={ `${BASE_CLASS}-popover-cover` } onClick={ this._onClose.bind(this) } />
				<ChromePicker
					color={ this.state.color.toRgb() }
					disableAlpha={ true }
					onChange={ this._onColorChange.bind(this) }

				/>
			</div>
		)
	}

	render() {

		const colorStyle = { backgroundColor : this.state.color.toHexString() };
		const classes = [
			BASE_CLASS,
			`${BASE_CLASS}--${this.props.vertPlacement}`,
			`${BASE_CLASS}--${this.props.horPlacement}`
		];

		return (
			<div className={ classnames(classes) } >
				<div
					className={ `${BASE_CLASS}-indicator` }
					onClick={ this._onToggleDisplay.bind(this) }
					ref= { (el) => { this._indicatorEl = el; } }
					style={ colorStyle }
				/>
				{ this._renderPicker() }
			</div>
		);
	}
}

ColorChanger.propTypes = {
	horPlacement : React.PropTypes.oneOf(["center", "leftalign", "rightalign"]),
	vertPlacement : React.PropTypes.oneOf(["above", "below"])
};

ColorChanger.defaultProps = {
	horPlacement : "center",
	vertPlacement : "below"
};
