var Fixture = require('../util').Fixture;
var jshint = require('../../src');

describe('Stream compliance', function () {
  it('file should pass through', function (done) {
    var a = 0;

    var fakeFile = new Fixture('undef');

    var stream = jshint();
    stream.on('data', function (newFile) {
      a++;
      newFile.should.equal(fakeFile);
    });

    stream.once('end', function () {
      a.should.equal(1);
      done();
    });

    stream.write(fakeFile);
    stream.end();
  });
});