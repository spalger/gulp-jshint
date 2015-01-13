var RcFixture = require('../../util').RcFixture;
var Fixture = require('../../util').Fixture;
var lint = require('../../util').lint;
var should = require('should');

describe('basic', function () {
  it('should use passed config and fail', function (done) {
    lint({
      args: new RcFixture('.rc-undef'),
      file: new Fixture('undef'),
      eachFile: function (newFile) {
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(false);
        should.exist(newFile.jshint.results);
        should.exist(newFile.jshint.data);
        should.exist(newFile.jshint.opt);
        newFile.jshint.results[0].error.reason.should.equal('\'wadup\' is not defined.');
      }
    }, done);
  });

  it('should use passed config and pass', function (done) {
    lint({
      config: new RcFixture('.rc-!undef'),
      file: new Fixture('undef'),
      eachFile: function (newFile) {
        should.exist(newFile.jshint.success);
        newFile.jshint.success.should.equal(true);
        should.not.exist(newFile.jshint.results);
        should.not.exist(newFile.jshint.data);
        should.not.exist(newFile.jshint.opt);
      }
    }, done);
  });
});