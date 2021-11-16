# lottery-facility
Some APIs for designing lottery cracking systems.


<!-- TOC -->
- [Overview](#overview)
- [Install](#install)
- [Quick start](#quick-start)
- [Publishing](#publish-a-version)


## Overview
Features:
* Random numbers generator
* Draws statistics
* Draws prediction algorithms

CLI utilities:
* flash
* translate
* combination
* filter
* euromillions_draws
* kenoFR_draws


## Install
Install with npm:
```sh
npm install lottery-facility
npm install --save-dev @types/lottery-facility
```


## Quick start

### CommonJS
Import in your NodeJS project with CommonJS:
```JavaScript
const lotteryFacility = require('lottery-facility');

const box = new lotteryFacility.DrawBox(70);
const balls = box.draw(20);
console.log(balls);
```


### ES6 or TypeScript
Import in your NodeJS project with ES6 or TypeScript:

create a file test.ts (for Typescript) or test.js (for ES6)
```TypeScript
import { DrawBox } from 'lottery-facility';

const box = new DrawBox(70);
const balls = box.draw(20);
console.log(balls);
```

and compile with these commands
```sh
npx tsc test.ts
npx babel --presets=@babel/env test.js --out-file script-compiled.js
```

### Browsers
Import in your browser project from a CDN:
```html
<!DOCTYPE html>
<html>
<head>
  <title>Lottery-facility from CDN</title>
</head>
<body>

  <!-- Load lottery-facility library -->
  <script src="https://unpkg.com/lottery-facility@0.0.1-alpha.8/dist/lotteryfacility-webbundle.min.umd.js"></script>

  <script>
  const box = new LotteryFacility.DrawBox(70);
  const balls = box.draw(20);
  document.write(balls);
  </script>

</body>
</html>
```








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

https://definitelytyped.org/guides/contributing.html
https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html

-->







## Publish a version
Build and test the project with these commands
```sh
npm install
npm run build
npm run test
```

You can see what files will be embedded in the new release with the command below. Files and directories listed in **.gitignore** and **.npmignore** won't be in the package. Files and directories listed in the "files:" section of **package.json** file will be included in the final package.
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

Go to the root of the project, and publish publicly the new package version to the NPM registry. Once published a version can be deprecated, but it cannot be deleted nor re-used.
```sh
npm publish --access public
```


## License
The project is released under the [MIT license](http://www.opensource.org/licenses/MIT).


## Contributors
* [All Contributors](./AUTHORS)
