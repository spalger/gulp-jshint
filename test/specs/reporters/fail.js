var gutil = require('gulp-util');
var jshint = require('../../../src');
var should = require('should');

describe('jshint.reporter(fail)', function () {
  it('should emit error on failure', function (done) {
    var fakeFile = new gutil.File({
      path: './test/fixture/file.js',
      cwd: './test/',
      base: './test/fixture/',
      contents: new Buffer('doe =')
    });

    var stream = jshint();
    var failStream = jshint.reporter('fail');
    stream.pipe(failStream);

    failStream.on('error', function (err) {
      should.exist(err);
      err.message.indexOf(fakeFile.relative).should.not.equal(-1, 'should say which file');
      done();
    });

    stream.write(fakeFile);
    stream.end();
  });

  it('should emit when the second file fails and the first passes', function (done) {
    var passFile = new gutil.File({
      path: './test/fixture/file.js',
      cwd: './test/',
      base: './test/fixture/',
      contents: new Buffer('doe =')
    });

    var failFile = new gutil.File({
      path: './test/fixture/file.js',
      cwd: './test/',
      base: './test/fixture/',
      contents: new Buffer('doe =')
    });

    var stream = jshint();
    var failStream = jshint.reporter('fail');
    stream.pipe(failStream);

    failStream.on('error', function (err) {
      should.exist(err);
      err.message.indexOf(failFile.relative).should.not.equal(-1, 'should say which file');
      done();
    });

    stream.write(passFile);
    stream.write(failFile);
    stream.end();
  });
});