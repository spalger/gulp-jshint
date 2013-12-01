/*jshint node:true */

"use strict";

var es = require('event-stream'),
  jshint = require('jshint').JSHINT;

var formatOutput = function(success, file, opt) {
  // no error
  if (success) return {success:success};

  // errors
  var results = jshint.errors.map(function (err) {
    if (!err) return;
    return { file: file.path || "stdin", error: err };
  }).filter(function (err) {
    return err;
  });

  var data = [jshint.data()];
  data[0].file = file.path || "stdin";

  var output = {
    success: success,
    results: results,
    data: data,
    opt: opt
  };

  return output;
};

var jshintPlugin = function(opt){
  return es.map(function (file, cb) {
    var success = jshint(String(file.contents), opt);

    // send status down-stream
    file.jshint = formatOutput(success, file, opt);

    cb(null, file);
  });
};

jshintPlugin.reporter = function (reportWriter) {
  if (!reportWriter) reportWriter = 'default';

  // load jshint reporter
  var rpt = require('jshint/src/reporters/'+reportWriter).reporter;
  if (!rpt) {
    throw new Error('invalid reporter: '+reportWriter);
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