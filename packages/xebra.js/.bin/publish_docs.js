#!/usr/bin/env node
'use strict';

const ghpages = require('gh-pages');
const path = require('path');
const packageInfo = require(path.join(__dirname, '..', 'package.json'));

const options = {
	message: "updating Docs to version " + packageInfo.version
}

ghpages.publish(path.join(process.cwd(), 'docs'), options, (err) =>
{
		console.log("Publishing Docs folder version: " + packageInfo.version + " to gh-pages branch...\n" );
    if (err)
    {
        console.log(err);
        process.exit(1);

        return;
    }
    console.log("Done!")
    process.exit(0);
});