/*jshint node:true */

'use strict';

var map = require('map-stream');
var clone = require('lodash.clone');
var jshint = require('jshint').JSHINT;
var jshintcli = require('jshint/src/cli');
var gutil = require('gulp-util');
var path = require('path');
var fs = require('fs');
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

// dead simple merge
var extend = function (dest, src) {
  Object.keys(src || {}).forEach(function (key) {
    if (dest[key] === void 0) {
      dest[key] = src[key];
    }
  });
  return dest;
};

var jshintPlugin = function(opt){
  if (!opt) opt = {};
  var globals = {};
  var findJshintRc = true;

  if (opt.auto !== void 0) {
    findJshintRc = opt.auto;
    delete opt.auto;
  }

  if (typeof opt === 'string'){
    opt = jshintcli.loadConfig(opt);
    findJshintRc = false;
    delete opt.dirname;
  }

  opt = clone(opt);
  if (opt.globals) {
    globals = opt.globals;
    delete opt.globals;
  }

  return map(function (file, cb) {
    if (file.isNull()) return cb(null, file); // pass along
    if (file.isStream()) return cb(new PluginError('gulp-jshint', 'Streaming not supported'));

    var str = file.contents.toString('utf8');
    var rcFile;
    var fileOpt = extend({}, opt);
    var fileGlobals = extend({}, globals);

    if (findJshintRc) {
      rcFile = findConfig(file);
      if (rcFile) {
        extend(fileOpt, rcFile);
        delete fileOpt.dirname;
        if (fileOpt.globals) {
          extend(fileGlobals, fileOpt.globals);
          delete fileOpt.globals;
        }
      }
    }

    var success = jshint(str, fileOpt, fileGlobals);

    // send status down-stream
    file.jshint = formatOutput(success, file, fileOpt);

    cb(null, file);
  });
};

var rcFileMap = {};
var findConfig = function (file) {
  var rcName = '.jshintrc';
  var rcPath;
  var rcFile;
  var checkPath;
  var searched = [];
  for (var dir = path.dirname(file.path); !~searched.indexOf(dir); dir = path.resolve(dir, '..')) {
    if (rcFileMap.hasOwnProperty(dir)) {
      rcPath = rcFileMap[dir];
      break;
    }

    searched.push(dir);
    checkPath = path.join(dir, rcName);
    if (fs.existsSync(checkPath)) {
      rcPath = checkPath;
      break;
    }
  }

  if (rcPath) {
    rcFile = jshintcli.loadConfig(rcPath);
    searched.forEach(function (dir) {
      rcFileMap[dir] = rcFile;
    });
  }

  return rcFile;
};

jshintPlugin.failReporter = function(){
  return map(function (file, cb) {
    // nothing to report or no errors
    if (!file.jshint || file.jshint.success) return cb(null, file);
    return cb(new Error('JSHint failed for '+file.relative), file);
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
