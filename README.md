# lottery-facility
Some APIs for designing lottery cracking systems.


<!-- TOC -->
- [Overview](#overview)
- [Install](#install)
- [Publishing](#publish-a-version)


## Overview

Features:

* Random numbers generator
* Draws statistics
* Draws prediction algorithms


## Install

Install with npm:

```sh
npm install @claudelalyre/lottery-facility
```

## Quick Start

import in your NodeJS project:

```js
const lottery = require('@claudelalyre/lottery-facility');

const balls = lottery.lotteryBalls(70);
lottery.shuffleBalls(balls, 30);
console.log(balls);
```

Or get it from a CDN:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Lottery-facility from CDN</title>
</head>
<body>

  <!-- Load lottery-facility library -->
  <script src="https://unpkg.com/filepond/dist/filepond.js"></script>

  <!-- Turn all file input elements into ponds -->
  <script>
  const balls = lotteryBalls(70);
  shuffleBalls(balls, 30);
  document.write(balls);
  </script>

</body>
</html>
```


https://unpkg.com/browse/@claudelalyre/lottery-facility@0.0.1-alpha.0/lib/



## Usage



<!--
lib/ is intended for code that can run as-is
src/ is intended for code that needs to be manipulated before it can be used
build/ is for any scripts or tooling needed to build your project
dist/ is for compiled modules that can be used with other systems.
bin/ is for any executable scripts, or compiled binaries used with, or built from your module.
test/ is for all of your project/module's test scripts
unit/ is a sub-directory for unit tests
integration/ is a sub-directory for integration tests
env/ is for any environment that's needed for testing
-->






## Publish a version

Build and test the project with these commands
```sh
npm run build
npm run test
```

You can see what files will be embedded in the new release with the command below. Files and directories listed in **.gitignore** and **.npmignore** won't be in the package.
```sh
npm pack
```

Update the package version with one of the following commands. If inside a Git directory, the **package.json** file's version is changed and committed. And a new Git tag related to the new version is created.
```sh
npm version prerelease --preid=alpha
npm version prerelease --preid=beta
npm version prerelease --preid=rc
npm version patch
npm version minor
npm version major
```

Push the new Git tag to remote origin
```sh
git push --tags
```

Go to the root of the project, and publish publicly the new package version to the NPM registry. Once published a version can be deprecated, but it cannot be deleted and re-used.
```sh
npm publish --access public
```


## Contributors

* [All Contributors](./AUTHORS)

