# lottery-facility
Some APIs for designing lottery cracking systems.


<!-- TOC -->
- [Overview](#overview)
- [Install](#install)


## Overview

Features:

* Full SOAP Client capability and mock-up SOAP server capability
* Handles both RPC and Document styles
* Handles both SOAP 1.1 and SOAP 1.2 Fault
* APIs to parse XML into JSON and JSON into XML
* API to describe WSDL document
* Support for both synchronous and asynchronous method handlers
* WS-Security (currently only UsernameToken and PasswordText encoding is supported)

## Install

Node.js version 10, 12, and 14 are officially supported. We dropped version 8
support in 3.0.0.

Install with npm:

```sh
npm install strong-soap
```


## Usage



https://medium.com/cameron-nokes/the-30-second-guide-to-publishing-a-typescript-package-to-npm-89d93ff7bccd
https://github.com/ccnokes/dom-event-utils



1) NPM account on https://www.npmjs.com/signup
2) Connect to NPM accounty
npm login


npmjs.com
claudelalyre


lib/ is intended for code that can run as-is
src/ is intended for code that needs to be manipulated before it can be used
build/ is for any scripts or tooling needed to build your project
dist/ is for compiled modules that can be used with other systems.
bin/ is for any executable scripts, or compiled binaries used with, or built from your module.
test/ is for all of your project/module's test scripts
unit/ is a sub-directory for unit tests
integration/ is a sub-directory for integration tests
env/ is for any environment that's needed for testing



npm init --scope=claudelalyre







npm install my-package

2.0.0
2.0.0-rc.2
2.0.0-rc.1
1.0.0
1.0.0-beta

1.0.0-alpha
1.0.0-alpha.1
1.0.0-0.3.7


Git tags
v16.13.1
v2.6.0-beta.2
v2.6.0-beta.3 


Run build
$ npm run build

Commit changes
Run tests (if there are any)
$ npm test


$ git add .
$ git commit -m "description"


Update version in package.json according to Semver
npm view
npm ls
$ npm version patch|minor|major

1.2.3 => 2.0.0-alpha.0
npm version premajor --preid alpha


npm --no-git-tag-version version

2.0.0-alpha.0 => 2.0.0-beta.0
npm version prerelease --preid=beta
npm version prerelease --preid=alpha
npm version patch
npm version minor
npm version major


npm version prerelease --preid=next
npm --no-git-tag-version version

npm version [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease [--preid=<prerelease-id>] | from-git]

'npm [-v | --version]' to print npm version
'npm view <pkg> version' to view a package's published version
'npm ls' to inspect current package/dependency versions



<!--
Create a git tag according to Semver
Push the package to Github
$ git push --tags
-->


Go to pacakge root
npm link 

Go to test directory
npm link fullpath/my-package
or
npm install fullpath/my-package


Push the package to npm
publish publicly a user-scoped NPM package.
npm publish --access public


Create release notes for every update











## Contributors

 * [All Contributors](./AUTHORS)
 