# lottery-facility
Some APIs for designing lottery cracking systems.


<!-- TOC -->
- [Overview](#overview)
- [Install](#install)
- [Quick start](#quick-start)
- [CLI utilities](#cli-utilities)
- [Publishing](#publish-a-version)


## Overview
Features:
* Random numbers generator
* Random selections of numbers
* Draws statistics
* Draws prediction algorithms

CLI utilities:
* flash
* combination
* translate
* euromillions_draws
* kenoFR_draws
* balancer
* filter

<!--
Type this command to enable CLI utilities (during development)
$ npm link
-->


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



## CLI utilities
All the following documentation is available in the tools by running `--help` on command line.

### 1. flash
**Parameters**<br>
```sh
--total, -t  Total number of lottery balls
--size, -s   Size of generated combinations
--sort       Display ordered combinations
--nb         Number of generated combinations
--nbSwap     Number of shuffle operations
```

**Description**<br>
This script generates a random selection of lottery balls, taken from `1` to `total` balls.
The optional parameter `sort` sorts combinations items in ascending order.
You can put `total` and `size` pairs multiple times for random selection into multiple draw boxes.

**Exemple**<br>
Generate 8 random games for Euromillions lottery.
```sh
$ flash --total 50 --size 5 --total 12 --size 2 --nb 8 --sort
07 10 12 17 28 | 04 08
01 10 15 48 50 | 02 10
03 14 16 30 40 | 07 11
01 13 19 25 40 | 01 12
06 11 39 40 48 | 02 03
05 09 26 32 48 | 01 03
07 21 31 48 50 | 10 11
11 20 23 33 40 | 09 12
```

### 2. combination
**Parameters**<br>
```sh
--total, -t     Total number of lottery balls
--size, -s      Size of generated combinations
--file, -f      A file containing one item of combination per line
--numbers, -n   Items of combinations separated by '|', or ' '
```

**Description**<br>
This script generates combinations of items taken in file `file` or list `numbers`, of size `size`, implementing choice of `size` items among `total` items.
Only the first `total` items of `file` or `numbers` are used to build combinations.

**Exemple**<br>
Generate all combinations of size 3 in a list of 5 numbers (choice of 3 among 5).
```sh
$ combination --size 3 --total 5 --numbers "01 02 03 04 05 06 07 08 09 10"
01 02 03
01 02 04
01 02 05
01 03 04
01 03 05
01 04 05
02 03 04
02 03 05
02 04 05
03 04 05
```

### 3. translate
**Parameters**<br>
```sh
--file, -f    A file containing one combination per line to be translated
--originnum   Items of combinations separated by '|' or ' '
--originfile  File containing one item per line that are used in combinations of <file> file
--targetnum   Items of combinations separated by '|' or ' ', for the translation of combinations
--targetfile  File containing one item per line used for the translation <file> file
```

**Description**<br>
This script takes an input file `file` containing one combination per line.
These input combinations are written with the `origin` alphabet and to be translated into `target` alphabet.
Items of `origin` alphabet are translated to `target` alphabet relatively to their corresponding order of declaration.<br>
The `origin` alphabet can be declared either with `originnum` or `originfile` parameters.<br>
The `target` alphabet can be declared either with `targetnum` or `targetfile` parameters.<br>

**Exemple**<br>
We start with a tactical `GAME.txt` file written with the origin alphabet `01 02 03 04 05 06 07 08 09 10 11 12`.
```sh
$ cat GAME.txt
01 02 03 04 05 06
07 01 02 08 05 09
07 04 08 10 06 09
01 02 04 08 10 11
07 01 03 10 06 11
03 08 10 05 06 11
07 03 04 05 09 11
07 01 04 08 05 12
07 02 03 08 06 12
02 03 04 10 09 12
01 10 05 06 09 12
07 02 10 05 11 12
01 03 08 09 11 12
02 04 06 09 11 12
```

After many hours of statistics analysis, we select 12 high probability winning numbers. These numbers are `25 28 31 34 37 52 53 59 61 67 68 70`.
We need to apply this selection onto our tactical `GAME.txt` file. We use the `translate` tool to do that job with the following command
```sh
$ translate --file GAME.txt --originnum "01 02 03 04 05 06 07 08 09 10 11 12" \
--targetnum "25 28 31 34 37 52 53 59 61 67 68 70"
25 28 31 34 37 52
53 25 28 59 37 61
53 34 59 67 52 61
25 28 34 59 67 68
53 25 31 67 52 68
31 59 67 37 52 68
53 31 34 37 61 68
53 25 34 59 37 70
53 28 31 59 52 70
28 31 34 67 61 70
25 67 37 52 61 70
53 28 67 37 68 70
25 31 59 61 68 70
28 34 52 61 68 70
```

### 4. euromillions_draws

### 5. kenoFR_draws







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
