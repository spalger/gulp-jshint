var RcFixture = require('../../util').RcFixture;
var lint = require('../../util').lint;
var File = require('../../util').File;
var should = require('should');

describe('file ignored', function () {
  it('should ignore based on simple directory name', function (done) {
    lint({
      config: new RcFixture('.rc-undef'),
      file: new File({
        path: 'node_modules/vendor.js',
        contents: new Buffer('wadup = 123;')
      }),
      eachFile: function (file) {
        should(file).not.have.property('jshint');
      }
    }, done);
  });

  it('should ignore based on simple directory name with trailing slash', function (done) {
    lint({
      config: new RcFixture('.rc-undef'),
      file: new File({
        path: 'test_ignore_stuff/vendor.js',
        contents: new Buffer('wadup = 123;')
      }),
      eachFile: function (file) {
        should(file).not.have.property('jshint');
      }
    }, done);
  });

  it('ignores the base path of the file', function (done) {
    var file = new File({
      path: 'index.js',
      contents: new Buffer('alert();')
    });

    Object.defineProperty(file, 'base', {
      get: function () {
        throw new Error('file.base shouldn\'t be used anywhere');
      }
    });

    lint({
      file: file,
      eachFile: function () {}
    }, done);
  });
});