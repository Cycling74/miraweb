module.exports = {
	extends: "c74",
	rules : {
		"no-param-reassign": 0
	},
	env : {
		es6: true,
		node: true,
		browser: true
	},
	parser: "babel-eslint",
	parserOptions: {
		sourceType: "module"
	}
}
