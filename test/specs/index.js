require('mocha');
require('should');

var join = require('path').join;
var fs = require('fs');

describe('gulp-jshint', function () {
  var testDirectory = join(__dirname, '../../test_ignore_stuff');
  before(function (done) { fs.mkdir(testDirectory, done); });
  after(function (done) { fs.rmdir(testDirectory, done); });

  require('./compliance');
  require('./stream');
  require('./linting');
  require('./reporters');
  require('./integration');
});
