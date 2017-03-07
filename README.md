MiraWeb
=============

![MiraWeb](packages/miraweb/src/assets/miraweb_logo_bar.png)

## Setup

If you'd just like to use MiraWeb the easiest way to do so is to download the MiraWeb package from the Max Package Manager. All necessary files, objects etc. are included and you should be good to go.

## Contribute

You like the MiraWeb project and would like to contribute? Perfect! Please use the GitHub issue tracker in case you experience any bugs or get in touch for your feature requests or potential features you'd like to add. Please make sure to read our Contributing Guide before submitting any changes.

[Contributing Guide](CONTRIBUTING.md)

## How To Build

Note that most users won't need to do this and should rather use MiraWeb package in Max' Package Manager. However if you are developing MiraWeb you might need to build. Please be aware that you still need to have the MiraWeb
Max package installed in order to have Max support the Web enabling communication.

Make sure you have Node.js and NPM installed and then in the cloned repository folder do the following to install all necessary dependencies:

```
$> npm install
```

If you want to build an development/debug version please run:

```
$> npm run build
```

This will create a `dev_build` folder with the necessary files to run MiraWeb. Just open the index.html and you should be good to go. For convenience there is also a `watching` task available:

```
$> npm run watch
```


If you'd like to bundle a release build please run:

```
$> npm run build-release
```

This will bundle the necessary files into an optimized build in the `build` folder.

In order to avoid retyping the host and port of the Max instance to connect to you can use the following query parameters appended to the file url in your Browser in order to have them set on start of the MiraWeb client:

	?hostname=<localhost>&port=<port>
	// f.e.
	?hostname=localhost&port=8086

## License

[MIT](LICENSE)
