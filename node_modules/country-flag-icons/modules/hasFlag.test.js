import hasFlag from './hasFlag';
describe('hasFlag', function () {
  it('should return whether a flag icon exists', function () {
    hasFlag('RU').should.equal(true);
    hasFlag('ZZ').should.equal(false);
  });
});
//# sourceMappingURL=hasFlag.test.js.map