var PluginError = require('gulp-util').PluginError;
var jshintcli = require('jshint/src/cli');
var through2 = require('through2');
var fileIgnored = require('./file-ignored');

module.exports = function extract(when) {
  when = when || 'auto';

  return through2.obj(function (file, enc, done) {
    fileIgnored(file, function (err, ignored) {
      if (!err && !ignored) {
        file.jshint = file.jshint || {};
        file.jshint.extracted = jshintcli.extract(file.contents.toString('utf8'), when);
      }
      done(err, file);
    });
  });
};