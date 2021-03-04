const request = require('request')
const should = require('chai').should()

module.exports = function (options) {
  it('should return 200 for /', (done) => {
    request('http://localhost:3000/', (e, r, b) => {
      r.statusCode.should.equal(200)
      return done(e)
    })
  })

  it('should return 200 for /resource/id', (done) => {
    request('http://localhost:3000/resource/101', (e, r, b) => {
      r.statusCode.should.equal(200)
      return done(e)
    })
  })

  it('should return 200 for ' + options.url, (done) => {
    request('http://localhost:3000' + options.url, (e, r, b) => {
      r.statusCode.should.equal(200)
      should.exist(r.headers['content-type'])
      r.headers['content-type'].should.equal('text/plain; charset=utf-8')
      b.should.have.string('# HELP ')
      b.should.have.string('"/resource/"')
      b.should.have.string('cardinality="one"')
      b.should.have.string('cardinality="many"')
      b.should.have.string('status="200"')
      return done(e)
    })
  })
}
