var gutil = require('gulp-util');
var tutil = require('../../util');
var jshint = require('../../../src');
var path = require('path');
var should = require('should');

describe('file ignored', function () {
  it('should ignore based on simple directory name', function (done) {
    tutil.lint({
      config: tutil.fixture('.rc-undef'),
      file: new tutil.File({
        path: 'node_modules/vendor.js',
        contents: new Buffer('wadup = 123;')
      }),
      eachFile: function (file) {
        should(file).not.have.property('jshint');
      }
    }, done);
  });

  it('should ignore based on simple directory name with trailing slash', function (done) {
    tutil.lint({
      config: tutil.fixture('.rc-undef'),
      file: new tutil.File({
        path: 'test_ignore_stuff/vendor.js',
        contents: new Buffer('wadup = 123;')
      }),
      eachFile: function (file) {
        should(file).not.have.property('jshint');
      }
    }, done);
  });

  it('ignores the base path of the file', function (done) {
    var file = new tutil.File({
      path: 'index.js',
      contents: new Buffer('alert();')
    });

    Object.defineProperty(file, 'base', {
      get: function () {
        throw new Error('file.base shouldn\'t be used anywhere');
      }
    });

    tutil.lint({
      file: file,
      eachFile: function () {}
    }, done);
  });
});