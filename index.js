/*jshint node:true */

'use strict';

var map = require('map-stream');
var jshint = require('jshint').JSHINT;
var jshintcli = require('jshint/src/cli');
var gutil = require('gulp-util');
var RcLoader = require('rcloader');
var PluginError = gutil.PluginError;

var formatOutput = function(success, file, opt) {
  // no error
  if (success) return {success: success};

  var filePath = (file.path || 'stdin');

  // errors
  var results = jshint.errors.map(function (err) {
    if (!err) return;
    return {file: filePath, error: err};
  }).filter(function (err) {
    return err;
  });

  var data = [jshint.data()];
  data[0].file = filePath;

  var output = {
    success: success,
    results: results,
    data: data,
    opt: opt
  };

  return output;
};

var jshintPlugin = function(opt){
  var rcLoader = new RcLoader('.jshintrc', opt, {
    loader: function (path) {
      var cfg = jshintcli.loadConfig(path);
      delete cfg.dirname;
      return cfg;
    }
  });

  return map(function (file, cb) {
    if (file.isNull()) return cb(null, file); // pass along
    if (file.isStream()) return cb(new PluginError('gulp-jshint', 'Streaming not supported'));
    rcLoader.for(file.path, function (err, cfg) {
      if (err) return cb(err);

      var globals;
      if (cfg.globals) {
        globals = cfg.globals;
        delete cfg.globals;
      }

      var str = file.contents.toString('utf8');
      var success = jshint(str, cfg, globals);
      // send status down-stream
      file.jshint = formatOutput(success, file, cfg);
      cb(null, file);
    });
  });
};

jshintPlugin.failReporter = function(){
  return map(function (file, cb) {
    // nothing to report or no errors
    if (!file.jshint || file.jshint.success) return cb(null, file);
    return cb(new PluginError('gulp-jshint', 'JSHint failed for '+file.relative), file);
  });
};

jshintPlugin.loadReporter = function(reporter) {
  // we want the function
  if (typeof reporter === 'function') return reporter;

  // object reporters
  if (typeof reporter === 'object' && typeof reporter.reporter === 'function') return reporter.reporter;

  // load jshint built-in reporters
  if (typeof reporter === 'string') {
    try {
      return jshintPlugin.loadReporter(require('jshint/src/reporters/'+reporter));
    } catch (err) {}
  }

  // load full-path or module reporters
  if (typeof reporter === 'string') {
    try {
      return jshintPlugin.loadReporter(require(reporter));
    } catch (err) {}
  }
};

jshintPlugin.reporter = function (reporter) {
  if (!reporter) reporter = 'default';
  if (reporter === 'fail') {
    return jshintPlugin.failReporter();
  }
  var rpt = jshintPlugin.loadReporter(reporter);

  if (typeof rpt !== 'function') {
    throw new PluginError('gulp-jshint', 'Invalid reporter');
  }

  // return stream that reports stuff
  return map(function (file, cb) {
    // nothing to report or no errors
    if (!file.jshint || file.jshint.success) return cb(null, file);

    rpt(file.jshint.results, file.jshint.data, file.jshint.opt);
    return cb(null, file);
  });
};

module.exports = jshintPlugin;
