const { dirname } = require("path");

module.exports = {
	"tags": {
		"allowUnknownTags": true,
		"dictionaries": [
			"jsdoc",
			"closure"
		]
	},
	"source": {
		"include": [
			"./src"
		],
		"exclude": [],
		"includePattern": ".+\\.js(doc)?$",
		"excludePattern": "(^|\\/|\\\\)_"
	},
	"plugins": [
		"plugins/markdown",
		require.resolve("jsdoc-babel")
	],
	"babel": {
		"presets": [],
		"sourceMap": true,
		"plugins": [
			"babel-plugin-transform-class-properties"
		]
	},
	"templates": {
		"cleverLinks": false,
		"monospaceLinks": false,
		"meta": {
			"titlePrefix": "Xebra.js Docs",
			"description": "Xebra.js API Documentation"
		},
		"default": {
			"outputSourceFiles": true,
			"staticFiles": {
				"paths": ["tutorials"],
				"include": [],
				"excludePattern": ".+\\.md$"
			}
		},
		"applicationName": "Xebra",
		"footer": "TODO",
		"copyright": "TODO",
		"linenums": true
	},
	"markdown": {
		"parser": "gfm",
		"hardwrap": false
	},
	"opts": {
		"encoding": "utf8",
		"recurse": true,
		"private": false,
		"lenient": true,
		"destination": "./docs",
		"package": "./package.json",
		"readme": "./README.md",
		"template": dirname(require.resolve("jaguarjs-jsdoc")),
		"tutorials": "./tutorials"
	}
};
