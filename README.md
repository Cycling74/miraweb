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

Make sure you have Node.js (version 6.4.0 or later) and NPM installed and then in the cloned repository folder do the following to install all necessary dependencies and set up the monorepo (incl. the proper npm links and additional configuration):

```
$> npm run setup
```

All the packages can be found in the `/packages` folder. So after setting up the repository please feel free to switch to the package folder you'd like to work on and follow any further, package instructions there.

## Scripts

### Repo Setup

Use this to setup the repository

```
$> npm run setup
```

### Repo Cleanup

Use this to clean up the monorepo and remove all interdependencies.

```
$> npm run clean
```

### Build

You can build the MiraWeb client using one of the following three scripts/configurations.

```
// start dev-server on http://localhost:8080
// watches for changes and does live reloading
// initial bundle build can take a few sec -> console shows progress
$> npm run serve
```

```
// development build -> dev_build folder
$> npm run build
```

```
// release build -> build folder
$> npm run build-release
```


### Tests

Use one of the following to run tests and linting

```
// Run MiraWeb and included packages tests
$> npm run testall
```

```
// MiraWeb tests only
$> npm run test
```

## License

[MIT](LICENSE)
