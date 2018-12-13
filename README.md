MiraWeb
=============

![MiraWeb](src/assets/miraweb_logo_bar.png)


## Setup

If you'd just like to use MiraWeb the easiest way to do so is to download the MiraWeb package from the Max Package Manager. All necessary files, objects etc. are included and you should be good to go.

## Packages

This repository follows a Monorepo approach and therefore includes the MiraWeb client and additional, supporting packages (formerly separated into multiple repositories). These packages are:

* [xebra.js](packages/xebra.js)
* [xebra-communicator](packages/xebra-communicator)

Out of these three xebra.js and xebra-communicator are available via npm although you might only wanna use xebra.js for your own applications (as it uses xebra-communicator internally). The source code for the MiraWeb Max package client can be found in `src`.

## Contribute

You like the MiraWeb and its related projects and would like to contribute? Perfect! Please use the GitHub issue tracker in case you experience any bugs or get in touch for your feature requests or potential features you'd like to add. Please make sure to read our Contributing Guide before submitting any changes.

[Contributing Guide](CONTRIBUTING.md)

## Setup

Note that most users won't need to do this and should rather use MiraWeb package in Max' Package Manager. However if you are developing MiraWeb or one of its packages you might need to have to setup properly. Please be aware that you still need to have the MiraWeb Max package installed in order to have Max support the Web enabling communication.

Make sure you have Node.js (version 10.13.0 or later) and Yarn (version 1.12.3 or later) installed and then in the cloned repository folder do the following to install all necessary dependencies and set up the monorepo (incl. the proper package links and additional configuration):

```
$> yarn install
```

All the packages can be found in the `/packages` while the MiraWeb source can be found in the `/src` folder. So after setting up the repository please feel free to switch to the package folder you'd like to work on and follow any further, package instructions there.

## Scripts
    "serve": "node ./scripts/serve.js",

    "test": "node ./scripts/test.js"

### Repo Setup

Use this to install all dependencies and setup the repository
```
$> yarn install
```

### Repo Cleanup

Use this to clean up the monorepo and remove all interdependencies.

```
$> yarn run clean
```

### Build

You can build the MiraWeb client using one of the following three scripts/configurations.

```
// start dev-server on http://localhost:8080
// watches for changes and does live reloading
// initial bundle build can take a few sec -> console shows progress
$> yarn run serve
```

```
// development build -> dev_build folder
$> yarn run build
```

```
// release build -> build folder
$> yarn run build-release
```

### Tests

Use one of the following to run tests and linting

```
// Run MiraWeb and included packages tests
$> yarn run test
```

If you'd only like to run the linter please run

```
$> yarn run lint
```

or to apply auto-fixing of linting errors

```
$> yarn run lint-fix
```

### Versioning & Publishing

This Repo contains multiple packages that need to be updated on NPM whenever we do a release. Additionally the Max Package needs to be updated by a Cycling '74 member via the Max Package Manager including the externally maintained externals. The following describes a guide on how to maintain versions, build a release and publish to npm. If you'd like to build pre-release version for testing as a Max Package etc, please branch beforehand and use this without publishing to npm. The latter version can be achieved using

```
$> yarn run setversion
```

If we are looking at an actual release: we use a single script to perform all publishing related tasks:

```
$> yarn publish
```

What it does is the following:

* *prepublish*
	* run and ensure all tests succeed.
	* adjust version (asking you for the correct new version) and perfom git related tasks (commit package.json files, git-tag correctly)
* *publish*
	* build and publish xebra-communicator to npm
	* build and publish xebra.js to npm
* *postpublish*
	* build xebra.js docs and publish them using GitHub Pages
	* TODO: create a GitHub Release draft (currently done manually)
	* TODO: update S3 hosted pre-built Xebra.js versions (currently done manually)

After this please make sure to check the GitHub Release draft, fill in any additional info and make it public.

## License

[MIT](LICENSE)
