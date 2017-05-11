# minimap-capture

A minimap wrapper that captures the dynamic part. Useful for constructing identifiers from paths.

[![Build Status](https://travis-ci.org/lukescott/minimatch-capture.svg?branch=master)](https://travis-ci.org/lukescott/minimatch-capture) [![codecov](https://codecov.io/gh/lukescott/minimatch-capture/branch/master/graph/badge.svg)](https://codecov.io/gh/lukescott/minimatch-capture)

## Installation

```
npm install --save minimap-capture
```

## Usage

```js
var capture = require("minimap-capture")

capture("foo/bar/a/bat/index.js", "foo/*/a/*/index.js") // "bar/a/bat"
capture("foo/bar/b/bat/index.js", "foo/*/a/*/index.js") // false
```

## Capture class

Create a capture object by instantiating the capture.Capture class.

```js
var Capture = require("capture").Capture
var c = new Capture(pattern, options)
```

### Properties

* `pattern` The original pattern.
* `options` The options supplied to the constructor.
* `regexp` Created by the `makeRe` method.  A single regular expression
  expressing the entire pattern.

### Methods

* `makeRe` Generate the `regexp` member if necessary, and return it.
  Will return `false` if the pattern is invalid.
* `capture(path)` Return captured portion of the path, or
  false otherwise.

### capture(path, pattern, options)

Main export. Capture a portion of the path.

```javascript
var result = capture("foo/bar/a/bat/index.js", "foo/*/a/*/index.js") // bar/a/bat
```

Returns false if pattern does not match.

### capture.match(list, pattern, options)

Match against the list of files and return both full path and captured portion.

```javascript
var fileList = [
	"foo/bar/a/bat/index.js",
	"foo/bar/a/bing/index.js",
	"foo/bar/b/bat/index.js",
	"foo/bar/b/bing/index.js",
]
var files = capture.match(fileList, "*.js")
/*
files = [
	["foo/bar/a/bat/index.js", "bar/a/bat"],
	["foo/bar/a/bing/index.js", "bar/a/bing"]
]
*/
```

### capture.makeRe(pattern, options)

Make a regular expression object from the pattern.
Adds a capture group for the captured portion.
If pattern is braced more than one capture group is added.
