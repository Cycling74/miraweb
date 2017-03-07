MiraWeb
=============

![MiraWeb](src/assets/miraweb_logo_bar.png)

## Contribute

You like the MiraWeb and its related projects and would like to contribute? Perfect! Please use the GitHub issue tracker in case you experience any bugs or get in touch for your feature requests or potential features you'd like to add. Please make sure to read our Contributing Guide before submitting any changes.

[Contributing Guide](../../CONTRIBUTING.md)

## Setup

If you'd just like to use MiraWeb the easiest way to do so is to download the MiraWeb package from the Max Package Manager. All necessary files, objects etc. are included and you should be good to go.

## How To Build

Make sure you have followed the global [repository setup instructions](../../README.md#setup) first in order to have all dependencies setup correctly.

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
