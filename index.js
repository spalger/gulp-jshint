/*jshint node:true */

"use strict";

var es = require('event-stream'),
  jshint = require('jshint').JSHINT;

var gulpJSHint = function(opt){
  return es.map(function (file, cb) {
    var success = jshint(String(file.contents), opt);

    // send status down-stream
    file.jshint = {
      success: success,
      results: jshint.errors || [],
      data: [jshint.data()],
      opt: opt
    };
    file.jshint.errorCount = file.jshint.results.length;
    file.jshint.data[0].file = file.path;

    cb(null, file);
  });
};

gulpJSHint.reporterSimple = function () {
  return es.map(function (file, cb) {
    file.jshint.results.forEach(function (err) {
      console.log(file.path + ': line ' + err.line + ', col ' + err.character + ', code ' + err.code + ', ' + err.reason);
    });
    cb(null, file);
  });
};

gulpJSHint.reporter = function (reportWriter) {
  if (!reportWriter) {
    return gulpJSHint.reporterSimple();
  }
  var rpt = require(reportWriter).reporter;
  if (!rpt) {
    throw new Error('invalid reporter: '+reportWriter);
  }
  return es.map(function (file, cb) {
    rpt(file.jshint.results, file.jshint.data, file.jshint.opt);
    return cb(null, file);
  });
};

module.exports = gulpJSHint;
