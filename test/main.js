var jshint = require('../');
var should = require('should');
require('mocha');

describe('gulp-jshint', function() {
  describe('jshint()', function() {
    it('should jshint two files', function(done) {
      var stream = jshint();
      var fakeFile = {
        path: "/home/contra/test/file.js",
        shortened: "file.js",
        contents: new Buffer("wadup();")
      };

      var fakeFile2 = {
        path: "/home/contra/test/file2.js",
        shortened: "file2.js",
        contents: new Buffer("doe =")
      };

      stream.on('data', function(newFile){
        should.exist(newFile);
        should.exist(newFile.path);
        should.exist(newFile.shortened);
        should.exist(newFile.contents);
        newFile.path.should.equal("/home/contra/test/file.js");
        newFile.shortened.should.equal("file.js");
        String(newFile.contents).should.equal("wadup();");
        done();
      });
      stream.write(fakeFile);
      stream.write(fakeFile2);
      stream.end();
    });
  });
});
