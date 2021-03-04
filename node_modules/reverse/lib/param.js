'use strict'

module.exports = createParameter

function createParameter (name, validator, regex) {
  return new Parameter(name, validator, regex)
}

class Parameter {
  constructor (name, validator, regex) {
    this.name = name
    this.validator =
      typeof validator === 'function'
        ? createValidator(validator)
        : validator instanceof RegExp
          ? createRegExpValidator(validator)
          : validator
    this.regex = regex || '([^\\/]+)'

    if (typeof this.validator.validate !== 'function') {
      throw new Error('expected function or joi schema')
    }
  }
  validate (value) {
    return this.validator.validate(value)
  }
}

function createValidator (validator) {
  return {
    validator: validator,
    validate (value) {
      try {
        return {value: this.validator(value)}
      } catch (err) {
        return {error: err}
      }
    }
  }
}

function createRegExpValidator (rex) {
  return createValidator(value => {
    if (rex.test(value)) {
      return value
    }
    throw new Error(`expected '${value}' to match ${rex}`)
  })
}
