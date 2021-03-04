'use strict'

exports = module.exports = {}

exports.templateParser    = require('./commonjs/templateParser').default
exports.templateFormatter = require('./commonjs/templateFormatter').default
exports.parseDigit        = require('./commonjs/parseDigit').default
exports.parse             = require('./commonjs/parse').default
exports.format            = require('./commonjs/format').default

// Deprecated.
// I don't know why these functions exist.
exports.onChange       = require('./commonjs/inputControl').onChange
exports.onPaste        = require('./commonjs/inputControl').onPaste

exports.onCut          = require('./commonjs/inputControl').onCut
exports.onKeyDown      = require('./commonjs/inputControl').onKeyDown

// exports['default'] = ...