require('mocha');
require('should');

var join = require('path').join;
var fs = require('fs');

describe('gulp-jshint', function () {
  var testDirectory = join(__dirname, '../../test_ignore_stuff');

  function make(done) {
    fs.mkdir(testDirectory, function (err) {
      if (err && err.code === 'EEXIST') err = null;
      done(err);
    });
  }

  function clear(done) {
    fs.rmdir(testDirectory, done);
  }

  before(make);
  after(clear);

  require('./compliance');
  require('./stream');
  require('./linting');
  require('./reporters');
  require('./integration');
});
