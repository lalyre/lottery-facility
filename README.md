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


## Install

Install with npm:

```sh
npm install lottery-facility
```


## Quick start

Import in your NodeJS project:

```js
const lotteryFacility = require('lottery-facility');

const balls = lotteryFacility.lotteryBalls(70);
lotteryFacility.shuffleBalls(balls, 30);
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
  <script src="https://unpkg.com/lottery-facility@0.0.1-alpha.3/dist/lotteryfacility-webbundle.min.js"></script>

  <script>
  const balls = LotteryFacility.lotteryBalls(70);
  LotteryFacility.shuffleBalls(balls, 30);
  document.write(balls.slice(1, 11));
  </script>

</body>
</html>
```





## Usage
You could use like this:
```JavaScript
sha256('Message to hash');
sha224('Message to hash');

var hash = sha256.create();
hash.update('Message to hash');
hash.hex();

var hash2 = sha256.update('Message to hash');
hash2.update('Message2 to hash');
hash2.array();

// HMAC
sha256.hmac('key', 'Message to hash');
sha224.hmac('key', 'Message to hash');

var hash = sha256.hmac.create('key');
hash.update('Message to hash');
hash.hex();

var hash2 = sha256.hmac.update('key', 'Message to hash');
hash2.update('Message2 to hash');
hash2.array();
```
If you use node.js, you should require the module first:
```JavaScript
var sha256 = require('js-sha256');
```
or 
```JavaScript
var sha256 = require('js-sha256').sha256;
var sha224 = require('js-sha256').sha224;
```
It supports AMD:
```JavaScript
require(['your/path/sha256.js'], function(sha256) {
// ...
});
```
or TypeScript
```TypeScript
import { sha256, sha224 } from 'js-sha256';
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
-->


## Example
```JavaScript
sha256(''); // e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
sha256('The quick brown fox jumps over the lazy dog'); // d7a8fbb307d7809469ca9abcb0082e4f8d5651e46d3cdb762d02d0bf37c9e592
sha256('The quick brown fox jumps over the lazy dog.'); // ef537f25c895bfa782526529a9b63d97aa631564d5d789c2b765448c8635fb6c
sha224(''); // d14a028c2a3a2bc9476102bb288234c415a2b01f828ea62ac5b3e42f
sha224('The quick brown fox jumps over the lazy dog'); // 730e109bd7a8a32b1cb9d9a09aa2325d2430587ddbc0c38bad911525
sha224('The quick brown fox jumps over the lazy dog.'); // 619cba8e8e05826e9b8c519c0a5c68f4fb653e8a3d8aa04bb2c8cd4c

// It also supports UTF-8 encoding
sha256('中文'); // 72726d8818f693066ceb69afa364218b692e62ea92b385782363780f47529c21
sha224('中文'); // dfbab71afdf54388af4d55f8bd3de8c9b15e0eb916bf9125f4a959d4

// It also supports byte `Array`, `Uint8Array`, `ArrayBuffer` input
sha256([]); // e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
sha256(new Uint8Array([211, 212])); // 182889f925ae4e5cc37118ded6ed87f7bdc7cab5ec5e78faef2e50048999473f

// Different output
sha256(''); // e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
sha256.hex(''); // e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
sha256.array(''); // [227, 176, 196, 66, 152, 252, 28, 20, 154, 251, 244, 200, 153, 111, 185, 36, 39, 174, 65, 228, 100, 155, 147, 76, 164, 149, 153, 27, 120, 82, 184, 85]
sha256.digest(''); // [227, 176, 196, 66, 152, 252, 28, 20, 154, 251, 244, 200, 153, 111, 185, 36, 39, 174, 65, 228, 100, 155, 147, 76, 164, 149, 153, 27, 120, 82, 184, 85]
sha256.arrayBuffer(''); // ArrayBuffer
```



https://github.com/rmariuzzo/markdown-swagger/blob/master/index.js
https://github.com/rmariuzzo/php-array-to-json/blob/master/package.json
https://github.com/yargs/yargs
https://github.com/chalk/chalk
https://github.com/sindresorhus/meow
https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e











## Publish a version

Build and test the project with these commands
```sh
npm install
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

