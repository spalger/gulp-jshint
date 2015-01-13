var Fixture = require('../util').Fixture;
var jshint = require('../../src');

describe('linting', function () {
  it('should jshint two files', function (done) {
    var a = 0;

    var stream = jshint();
    stream.on('data', function () {
      ++a;
    });

    stream.once('end', function () {
      a.should.equal(2);
      done();
    });

    stream.write(new Fixture('undef'));
    stream.write(new Fixture('undef'));
    stream.end();
  });
});