;(function(context, factory) {
	if (typeof require === "function" &&
		typeof exports === "object" &&
		typeof module === "object"
	) {
		module.exports = factory()
	} else {
		if (typeof define === "function" &&
			typeof define.amd  === "object"
		) {
			define(factory)
		} else {
			if (!context.chai) {
				throw new Error("chai-checkmark couldn't find Chai.")
			}
			context.chai.use(factory())
		}
	}
}(this, function() {
	"use strict";
	var nextTick = (typeof setImmediate === "function" ?
			setImmediate : setTimeout),
		noop = function() {}

	// Chai Plugin Definition
	return function chaiCheckmark(chai, util) {
		var Assertion = chai.Assertion,
			expect = chai.expect

		function check(done) {
			/*jshint validthis:true */
			var total = util.flag(this, "object"),
				count = 0
			expect(total).a("number").above(0, "Provide a count to check")
			if (done) {
				expect(done).a("function", "Provide a function for check")
			}

			function chain() {
				expect(count).below(total,
					"Target checkmarks already reached")
				count += 1;
			}
			function mark() {
				if (count === total && done) { nextTick(done, 0) }
				return noop;
			}
			mark.getCount = function() { return count; }

			Assertion.addChainableMethod("mark", mark, chain)
			return mark;
		}
		Assertion.addMethod("check", check)
		Assertion.addMethod("checks", check)
	}
}))
