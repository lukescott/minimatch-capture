"use strict"

const capture = require("./")
const minimatch = require("minimatch")

test("capture", () => {
	expect(capture("foo/abc/bar", "foo/*/bar")).toBe("abc")
	expect(capture("foo/a/bc/bar", "foo/*/bar")).toBe(false)
	expect(capture("foo/a/bc/bar", "foo/**/bar")).toBe("a/bc")
})

test("capture: case sensitivy", () => {
	expect(capture("foo/abc/Bar", "foo/*/bar")).toBe(false)
	expect(capture("foo/abc/Bar", "foo/*/bar", {nocase: true})).toBe("abc")
})

test("split", () => {
	expect([
		"one/two",
		"one/*/two",
		"one/**/two",
		"one/***/two",
		"one/*/two/*/three",
		"one/@(two)/three",
		"one/two@(Three)Four/five",
		"one/!(two)/three",
		"one/two!(Three)Four/five",
		"one/+(two)/three",
		"one/two+(Three)Four/five",
		"one/t?o/three",
		"one/t+o/three",
	].map(capture.split)).toMatchSnapshot()
})

test("makeRe", () => {
	expect([
		"one/two",
		"{one,}/two",
		"one/{two,}",
		"{one,}/{two,}",
		"zero{One,}/{two,}Three",
		"one/*/two",
		"one/**/two",
		"one/***/two",
		"one/*/two/*/three",
		"one/@(two)/three",
		"one/two@(Three)Four/five",
		"one/!(two)/three",
		"one/two!(Three)Four/five",
		"one/+(two)/three",
		"one/two+(Three)Four/five",
		"one/t?o/three",
		"one/t+o/three",
	].map(capture.makeRe).map(re => re.source)).toMatchSnapshot()
})

test("makeRe: minimatch parse will throw error", () => {
	expect(capture.makeRe("\\".repeat(1 + (1024 * 64)))).toBe(false)
})

test("Capture.makeRe cache", () => {
	const c = new capture.Capture("one/*/two")
	expect(c.regexp).toBeUndefined()
	expect(c.makeRe()).toBeInstanceOf(RegExp)
	expect(c.regexp).toBeDefined()
	const regexp = c.regexp
	expect(c.makeRe()).toBe(regexp)
})

const fixture = [
	{
		p: "one/two",
		f: ["one/two", "one/two/three", "three/four"],
	},
	{
		p: "{one,}/two",
		f: ["one/two", "/two"],
	},
	{
		p: "one/{two,}",
		f: ["one/two", "one/"],
	},
	{
		p: "{one,}/{two,}",
		f: ["one/two", "/"],
	},
	{
		p: "{one,}/{two,}",
		f: ["one/two", "/"],
		o: {notrim: true},
	},
	{
		p: "{one,}/middle/{two,}",
		f: ["one/middle/two", "/middle/"],
	},
	{
		p: "{one,}/middle/{two,}",
		f: ["one/middle/two", "/middle/"],
		o: {notrim: true},
	},
	{
		p: "zero{One,}/{two,}Three",
		f: ["zeroOne/twoThree", "zero/Three"],
	},
	{
		p: "zero{One,}/middle/{two,}Three",
		f: ["zeroOne/middle/twoThree", "zero/middle/Three"],
	},
	{
		p: "one/*/two",
		f: ["one/foo/two", "one/foo/bar/two"],
	},
	{
		p: "one/**/two",
		f: ["one/foo/two", "one/foo/bar/two"],
	},
	{
		p: "one/***/two",
		f: ["one/foo/two", "one/foo/bar/two"],
	},
	{
		p: "one/*/two/*/three",
		f: ["one/foo/two/bar/three", "one/f/oo/two/ba/r/three"],
	},
	{
		p: "one/@(two)/three",
		f: ["one/two/three", "one/twotwo/three"],
	},
	{
		p: "one/two@(Three)Four/five",
		f: ["one/twoThreeFour/five", "one/twoThreeThreeFour/five"],
	},
	{
		p: "one/!(two)/three",
		f: ["one/two/three", "one/two-/three", "one/-two/three", "one/foo/three"],
	},
	{
		p: "one/!(two)*/three",
		f: ["one/two/three", "one/two-/three", "one/-two/three", "one/foo/three"],
	},
	{
		p: "one/*!(two)/three",
		f: ["one/two/three", "one/two-/three", "one/-two/three", "one/foo/three"],
	},
	{
		p: "one/two!(Three)Four/five",
		f: ["one/twoThreeFour/five", "one/twoFour/five"],
	},
	{
		p: "one/!(two)/three",
		f: ["one/two/three", "one/two-/three", "one/-two/three"],
	},
	{
		p: "one/!(two)*/three",
		f: ["one/two/three", "one/two-/three", "one/-two/three"],
	},
	{
		p: "one/*!(two)/three",
		f: ["one/two/three", "one/two-/three", "one/-two/three"],
	},
	{
		p: "one/*!(two){/,/}three",
		f: ["one/two/three", "one/two-/three", "one/-two/three"],
	},
	{
		p: "one/{*!(two)/three,*!(two)/three}",
		f: ["one/two/three", "one/two-/three", "one/-two/three"],
	},
	{
		p: "one/{two/!(two),!(two)/two}/three",
		f: ["one/two/A/three", "one/B/two/three"],
	},
]

test("match", () => {
	expect(fixture.map(row => {
		return {
			p: row.p,
			o: row.o,
			r: capture.match(row.f, row.p, row.o)
		}
	})).toMatchSnapshot()
})

fixture.forEach(row => {
	const p = row.p
	const o = row.o
	const c = new capture.Capture(p, o)
	const m = new minimatch.Minimatch(p, o)
	row.f.forEach(f => {
		describe(p, () => {
			const notrim = o && o.notrim ? " (notrim)" : ""
			if (m.match(f)) {
				test(`${f}${notrim} is truthy`, () => {
					expect(c.capture(f)).toBeTruthy()
				})
			} else {
				test(`${f}${notrim} is falsy`, () => {
					expect(c.capture(f)).toBeFalsy()
				})
			}
		})
	})
})
