var gutil = require('gulp-util');
var jshintcli = require('jshint/src/cli');
var map = require('map-stream');

module.exports = function extract(when) {
  var newFileContent;

  // the JSHint CLI is looking for --extract=[auto|always|never]
  if (when !== 'auto' && when !== 'always' && when !== 'never') {
    // set it as always if not provided
    when = 'always';
  }

  // display flag in log
  gutil.log(gutil.colors.italic.gray('--extract'), gutil.colors.italic.blue(when));

  return map(function (file, cb) {
    newFileContent = jshintcli.extract(file.contents.toString('utf8'), when);
    file.contents = new Buffer(newFileContent);
    return cb(null, file);
  });
};
