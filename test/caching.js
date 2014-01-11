var jshint = require('../');
var should = require('should');
var gutil = require('gulp-util');
var path = require('path');
require('mocha');

describe('gulp-jshint', function() {
  beforeEach(function (done) {
    // Clear all previously cached successes
    jshint.cached.fileCache.clear(null, done);
  });

  describe('jshint.cached()', function() {
    it('should cache previously linted files', function (done) {
      var a = 0;

      var fakeFile = new gutil.File({
        path: './test/fixture/file.js',
        cwd: './test/',
        base: './test/fixture/',
        contents: new Buffer('wadup();')
      });

      var stream = jshint.cached({});

      stream.once('data', function(newFile){
        should.exist(newFile.jshint);
        should.not.exist(newFile.jshint.cached);

        newFile.jshint.success.should.equal(true);

        stream.once('data', function(newFile) {
            should.exist(newFile.jshint);
            newFile.jshint.success.should.equal(true);
            
            should.exist(newFile.jshint.cached);
            newFile.jshint.cached.should.equal(true);

            ++a;
        });

        ++a;
        stream.write(fakeFile);
        stream.end();
      });

      stream.once('end', function () {
        a.should.equal(2);
        done();
      });

      stream.write(fakeFile);
    });
  });

});