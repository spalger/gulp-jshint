var es = require('event-stream'),
  clone = require('clone'),
  jshint = require('jshint').JSHINT;

module.exports = function(opt){
  // clone options
  opt = opt ? clone(opt) : {};
  if (!opt.reporter) opt.reporter = "jshint/src/reporters/default.js";
  var reporter = require(opt.reporter).reporter;
  delete opt.reporter; //jshint cries about what we pass to it

  function check (file, cb) {
    var success = jshint(String(file.contents), opt);

    // linting error - format crap for reporter
    if (!success) {
      var results = jshint.errors.map(function (err) {
        if (err) {
          return { file: file.path || "stdin", error: err };
        }
      });
      var data = [jshint.data()];
      data[0].file = file.path || "stdin";
      reporter(results, data, opt);
      return;
    }

    cb(null, file);
  }
  return es.map(check);
};