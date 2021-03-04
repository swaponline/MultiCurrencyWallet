"use strict";
/* global describe, it, expect, Assertion, AssertionError */

describe("Chai Checkmark", function() {
	it("should add a method to Assertion", function() {
		expect(Assertion).to.respondTo("check")
		expect(Assertion).to.respondTo("checks")
	})

	describe("Assertion#Check()", function() {
		it("should return a function with methods", function() {
			var subject = expect(1).check()

			expect(subject).to.be.a("function")

			expect(subject).itself.to.respondTo("getCount")
		})

		it("should accept only numbers greater than 0", function() {
			expect(subject(-1)).to.Throw(AssertionError)
			expect(subject(0)).to.Throw(AssertionError)
			expect(subject("wat")).to.Throw(AssertionError)
			expect(subject(NaN)).to.Throw(AssertionError)

			subject(1)()
			subject(10)()
			subject(100)()

			function subject(value) {
				return function() {
					return expect(value).check();
				};
			}
		})

		it("should allow a callback function to be passed in", function() {
			expect(subject("wat")).to.Throw(AssertionError)

			subject(function() {})()

			function subject(callback) {
				return function() {
					return expect(1).check(callback);
				};
			}
		})
	})

	describe("Assertion#Mark()", function() {
		it("should increment the count", function() {
			var mark = expect(2).checks()

			expect(mark.getCount()).to.equal(0).mark()
			expect(mark.getCount()).to.equal(1).mark()
			expect(mark.getCount()).to.equal(2)
		})

		it("should throw an error if too many checks happened", function() {
			expect(1).check()

			subject()
			expect(subject).to.Throw(AssertionError)

			function subject() {
				return expect().mark();
			}
		})
	})
})
