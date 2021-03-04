const labels = require('../lib/labels')
const should = require('chai').should()

describe('labels', () => {
  it('should parse /users/', () => {
    labels.parse('/users/').path.should.equal('/users/')
    labels.parse('/users/').cardinality.should.equal('many')
  })
  it('should parse /users/freddie', () => {
    labels.parse('/users/freddie').path.should.equal('/users/')
    labels.parse('/users/freddie').cardinality.should.equal('one')
  })
  it('should parse /staff/users/', () => {
    labels.parse('/staff/users/').path.should.equal('/staff/users/')
    labels.parse('/staff/users/').cardinality.should.equal('many')
  })
  it('should parse /staff/users/freddie', () => {
    labels.parse('/staff/users/freddie').path.should.equal('/staff/users/')
    labels.parse('/staff/users/freddie').cardinality.should.equal('one')
  })
  it('should parse /static/page.css', () => {
    labels.parse('/static/page.css').path.should.equal('/static/page.css')
    labels.parse('/static/page.css').cardinality.should.equal('one')
  })
})
