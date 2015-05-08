var jshint = require('../../../src');
var Fixture = require('../../util').Fixture;
var stream = require('../../../src/stream');
var should = require('should');
var EventEmitter = require('events').EventEmitter;

describe('jshint.reporter(fail)', function () {
  it('should emit error on failure', function (done) {
    var fakeFile = new Fixture('undef-incomp');

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

  it('should ignore warnings', function (done) {
    var fakeFile = new Fixture('warn');
    var input = stream();
    var output;
    var reporter;
    var errored = false;

    input
      .pipe(jshint())
      .pipe(reporter = jshint.reporter('fail', { ignoreWarning: true }))
      .on('error', function () {
        errored = true;
      })
      .pipe(output = stream(function () {
        errored.should.be.false;
        reporter.unpipe(output);
        done();
      }));

      input.write(fakeFile);
      input.end();
  });

  it('should not ignore warnings', function (done) {
    var fakeFile = new Fixture('warn');
    var input = stream();
    var output;
    var reporter;
    var errored = false;

    input
      .pipe(jshint())
      .pipe(reporter = jshint.reporter('fail', { ignoreWarning: false }))
      .on('error', function () {
        errored = true;
      })
      .pipe(output = stream(function () {
        errored.should.be.true;
        reporter.unpipe(output);
        done();
      }));

      input.write(fakeFile);
      input.end();
  });

  var files = function (fails) {
    return [
      new Fixture('valid1'),
      fails && new Fixture('undef-incomp'),
      fails && new Fixture('undef-incomp2'),
      new Fixture('valid2')
    ].filter(Boolean);
  };

  it('should buffer all files until success is known', function (done) {
    var input = stream();
    var output;
    var reporter;
    var errored = false;

    input
      .pipe(jshint())
      .pipe(reporter = jshint.reporter('fail'))
      .on('error', function (err) {
        err.message.should.match(/incomp/);
        err.message.should.match(/incomp2/);
        // files will flow through if the error is "handled"
        errored = true;
      })
      .pipe(output = stream(function () {
        errored.should.equal(true);
        reporter.unpipe(output);
        done();
      }));


    files(true).forEach(function (file) { input.write(file); });
    input.end();
  });

  it('should pass all files through after success if certain', function (done) {
    var i = 0;
    var input = stream();

    input
      .pipe(jshint())
      .pipe(jshint.reporter('fail'))
      .pipe(stream(function () {
        i++;
      }, function () {
        i.should.equal(2);
        done();
      }));


    files().forEach(function (file) { input.write(file); });
    input.end();
  });

  it('should pass only emit error when `buffer: false`', function (done) {
    // really, checking that files are coming through before errors
    // which means that we are not waiting for errors and letting
    // streams handle them naturally

    var i = 0;
    var input = stream();
    var reporter;
    var errored = false;

    input
      .pipe(jshint())
      .pipe(reporter = jshint.reporter('fail', { buffer: false }))
      .pipe(stream(function () {
        if (i === 0) {
          errored.should.equal(false);
        }

        i++;
        /* through away files */
      }))
      .on('finish', done);

    reporter.emit = function (name) {
      // check for error without tripping "unhandled error" checks
      // like adding an error listener does
      if (name !== 'error') {
        EventEmitter.prototype.emit.apply(reporter, arguments);
      } else {
        errored = true;
      }
    };


    files(true).forEach(function (file) {
      input.write(file);
    });
    input.end();
  });
});