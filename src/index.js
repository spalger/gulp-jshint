'use strict';

var PluginError = require('gulp-util').PluginError;
var through2 = require('through2');
var reporters = require('./reporters');
var extract = require('./extract');
var fileIgnored = require('./file-ignored');
var makeLint = require('./lint');

var jshintPlugin = function (opt) {
  var lint = makeLint(opt);

  return through2.obj(function (file, enc, done) {
    var stream = this;

    fileIgnored(file, function (err, ignored) {
      if (err || ignored) {
        done(err, file);
      } else {
        lint(file, function (err) { done(err, file); });
      }
    });
  });
};

// expose the reporters
jshintPlugin.failReporter = reporters.fail;
jshintPlugin.loadReporter = reporters.load;
jshintPlugin.reporter = reporters.reporter;

// export the extractor
jshintPlugin.extract = extract;

module.exports = jshintPlugin;
