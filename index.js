/*jshint node:true */

'use strict';

var fs = require('fs');
var map = require('map-stream');
var jshint = require('jshint').JSHINT;
var jshintcli = require('jshint/src/cli');
var cache = require('gulp-cache');
var gutil = require('gulp-util');
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
  if (!opt) opt = {};
  var globals = {};

  if (typeof opt === 'string'){
    opt = jshintcli.loadConfig(opt);
    delete opt.dirname;
  }

  if (opt.globals) {
    globals = opt.globals;
    delete opt.globals;
  }

  return map(function (file, cb) {
    if (file.isNull()) return cb(null, file); // pass along
    if (file.isStream()) return cb(new PluginError('gulp-jshint', 'Streaming not supported'));

    var str = file.contents.toString('utf8');
    var success = jshint(str, opt, globals);

    // send status down-stream
    file.jshint = formatOutput(success, file, opt);

    cb(null, file);
  });
};

jshintPlugin.cached = function (opt) {
  // TODO: Find a better way to grab this
  var jshintVer = '2.4.0';
  var jshintOpts;

  if (typeof opt === 'string') {
    jshintOpts = fs.readFileSync(opt);
  } else {
    jshintOpts = JSON.stringify(opt);
  }
  
  return cache.proxy('jshint', {
    task: jshintPlugin(opt),
    key: function (file) {
      return [file.contents.toString('utf8'), jshintVer, jshintOpts].join('');
    },
    success: function (jshintedFile) {
      return jshintedFile.jshint.success;
    },
    value: function (jshintedFile) {
      var result = {
        jshint: {
          success: jshintedFile.jshint.success,
          cached: true
        }
      };

      return result;
    }
  });
};

jshintPlugin.cached.fileCache = cache.fileCache;

jshintPlugin.loadReporter = function(reporter) {
  // we want the function
  if (typeof reporter === 'function') return reporter;

  // object reporters
  if (typeof reporter === 'object' && typeof reporter.reporter === 'function') return jshintPlugin.loadReporter(reporter.reporter);

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
  var rpt = jshintPlugin.loadReporter(reporter);

  if (typeof rpt !== 'function') {
    throw new Error('Invalid reporter');
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
