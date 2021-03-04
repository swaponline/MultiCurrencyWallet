"use strict";

var chai = require("chai")
var chaiCheckmark = require("../chai-checkmark")

chai.should()
chai.use(chaiCheckmark)

global.chaiCheckmark = chaiCheckmark
global.expect = chai.expect
global.Assertion = chai.Assertion
global.AssertionError = chai.AssertionError
