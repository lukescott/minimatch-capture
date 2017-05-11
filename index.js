"use strict"

const minimatch = require("minimatch")
const splitRe = /([!?+*@]\([^)]+\)|\*{1,2}|\?)/
const endWithNegRe = /!\([^)]+\)$/

class Capture {
	constructor(pattern, options) {
		this.pattern = pattern
		this.options = options || {}
	}

	makeRe() {
		if (!this.regexp && this.regexp !== false) {
			this.regexp = makeRe(this.pattern, this.options)
		}
		return this.regexp
	}

	capture(path) {
		let result = false
		let match = path.match(this.makeRe())
		if (match) {
			match = match.filter(isDef)
			result = match[1] || match[0]
			if (!this.options.notrim && result !== "/") {
				result = result.replace(/^\/|\/$/g, "")
			}
		}
		return result
	}
}

function split(pattern) {
	const parts = pattern.split(splitRe)
	if (parts.length === 1) {
		return ["", parts[0], ""]
	}
	return [parts[0], parts.slice(1, -1).join(""), parts[parts.length - 1]]
}

const nonegate = {nonegate: true}

function _makeRe(pattern, options) {
	const flags = options && options.nocase ? "i" : ""
	const subpatterns = minimatch.braceExpand(pattern, options)
	const expressions = subpatterns.map(subpattern => {
		const parts = split(subpattern)
		const left = parts[0]
		const middle = parts[1]
		const right = parts[2]
		const opts = left ? Object.assign({}, options, nonegate) : options
		const re = minimatch.makeRe(middle, opts)
		let capture = re.source.slice(4, -2)
		if (endWithNegRe.test(middle)) {
			capture = capture.replace(/\)\$\)/g,
				"(?" + (right.startsWith("/") ? "=" : "!") + "/)))"
			)
		}
		return regExpEscape(left) + "(" + capture + ")" + regExpEscape(right)
	})
	return new RegExp("^(?:" + expressions.join("|") + ")$", flags)
}

function makeRe(pattern, options) {
	try {
		return _makeRe(pattern, options)
	} catch (e) {
		return false
	}
}

function match(list, pattern, options) {
	const cap = new Capture(pattern, options)
	const result = []
	for (let i = 0; i < list.length; i++) {
		const path = list[i]
		const match = cap.capture(path)
		if (match) {
			result.push([path, match])
		}
	}
	return result
}

module.exports = function(path, pattern, options) {
	return new Capture(pattern, options).capture(path)
}

Object.assign(module.exports, {
	Capture,
	split,
	makeRe,
	match,
})

function isDef(v) {
	return v !== undefined
}

// private function copied from https://github.com/isaacs/minimatch
function regExpEscape(s) {
	return s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&")
}
