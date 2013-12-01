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

var gulpJSHint = function(opt){
  return es.map(function (file, cb) {
    var success = jshint(String(file.contents), opt);

    // send status down-stream
    file.jshint = formatOutput(success, file, opt);

    cb(null, file);
  });
};

gulpJSHint.reporterSimple = function () {
  return es.map(function (file, cb) {
    file.jshint.results.forEach(function (err) {
      if (err) {
        console.log(file.path + ': line ' + err.line + ', col ' + err.character + ', code ' + err.code + ', ' + err.reason);
      }
    });
    cb(null, file);
  });
};

gulpJSHint.reporter = function (reportWriter) {
  if (!reportWriter) {
    return gulpJSHint.reporterSimple();
  }

  // load jshint reporter
  // legacy jshint reporters get a shimmed format
  var rpt = require('jshint/src/reporters/'+reportWriter).reporter;
  if (!rpt) {
    throw new Error('invalid reporter: '+reportWriter);
  }

  return es.map(function (file, cb) {
    rpt(file.jshint.results, file.jshint.data, file.jshint.opt);
    return cb(null, file);
  });
};

module.exports = gulpJSHint;
