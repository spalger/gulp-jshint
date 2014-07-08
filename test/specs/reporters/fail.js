var jshint = require('../../../src');
var tutil = require('../../util');
var stream = require('../../../src/stream');
var should = require('should');

describe('jshint.reporter(fail)', function () {
  it('should emit error on failure', function (done) {
    var fakeFile = new tutil.File({
      path: './test/fixture/file.js',
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

  var files = function () {
    return [
      new tutil.File({
        path: './test/fixture/valid1.js',
        contents: new Buffer('var a = 1;')
      }),
      new tutil.File({
        path: './test/fixture/invalid1.js',
        contents: new Buffer('doe =')
      }),
      new tutil.File({
        path: './test/fixture/invalid2.js',
        contents: new Buffer('fum =')
      }),
      new tutil.File({
        path: './test/fixture/valid2.js',
        contents: new Buffer('var b = 1;')
      })
    ];
  };

  it('should buffer all files until success is known', function (done) {
    var input = stream();

    input
      .pipe(jshint())
      .pipe(
        jshint.reporter('fail')
        .on('error', function (err) {
          err.message.should.match(/invalid1/);
          err.message.should.match(/invalid2/);
          done();
        })
      )
      .pipe(stream(function (file) {
        should.fail('files should have been buffered and not passed down stream');
      }));


    files().forEach(function (file) { input.write(file); });
    input.end();
  });
});