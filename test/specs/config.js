var Fixture = require('../util').Fixture;
var jshint = require('../../src');
var resolve = require('path').resolve;
var should = require('should');

describe('Config', function () {
  it('pointing to a specific config file works (issue #152)', function (done) {
    var stream = jshint(resolve(__dirname, '../fixtures/project/.jshintrc'));

    stream.on('data', function (file) {
      should(file.jshint.results).be.undefined();
    });

    stream.once('end', function () {
      done();
    });

    stream.write(new Fixture('project/src/index.js'));
    stream.write(new Fixture('project/src/index.js'));
    stream.end();
  });
});
