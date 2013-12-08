/*jshint node:true */

"use strict";

var es = require('event-stream'),
  jshint = require('jshint').JSHINT,
  jshintcli = require('jshint/src/cli');

var formatOutput = function(success, file, opt) {
  // no error
  if (success) return {success: success};

  var filePath = (file.path || "stdin");

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

  return es.map(function (file, cb) {
    var success = jshint(String(file.contents), opt, globals);

    // send status down-stream
    file.jshint = formatOutput(success, file, opt);

    cb(null, file);
  });
};

jshintPlugin.reporter = function (reporter) {
  if (!reporter) reporter = 'default';
  var rpt;
  // support custom reporters
  if (typeof reporter === 'function') rpt = reporter;
  if (typeof reporter === 'object') rpt = reporter.reporter;

  // load jshint built-in reporter
  if (typeof reporter === 'string') {
    try {
      rpt = require('jshint/src/reporters/'+reporter).reporter;
    } catch (err) {}
  }

  if (typeof rpt === 'undefined') {
    throw new Error('Invalid reporter');
  }

  // return stream that reports stuff
  return es.map(function (file, cb) {
    // nothing to report
    // or no errors
    if (!file.jshint || file.jshint.success) return cb(null, file);

    rpt(file.jshint.results, file.jshint.data, file.jshint.opt);
    return cb(null, file);
  });
};

module.exports = jshintPlugin;
