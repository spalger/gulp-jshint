var es = require('event-stream'),
  jshint = require('jshint').JSHINT;

module.exports = function(opt){
  var reporter;
  if (opt.reporter) {
    reporter = require(opt.reporter).reporter;
    // it cries about what we pass to it
    delete opt.reporter;
  }

  return es.map(function (file, cb) {
    var success = jshint(String(file.contents), opt);

    var data = [jshint.data()];
    data[0].file = file.path;

    // send status down-stream

    file.jshint = {
      success: success,
      errors: 0,
      data: data
    };

    if (!success) {
      var results = jshint.errors.map(function (err) {
        return {
          file: file.path,
          error: err,
          mess: file.path + ': line ' + err.line + ', col ' + err.character + ', code ' + err.code + ', ' + err.reason
        };
      });

      // send status down-stream
      file.jshint.results = results;
      file.jshint.errors = results.length;

      // call reporter if any
      if (reporter) {
        reporter(jshint.errors, data, opt);
      }
    }

    cb(null, file);
  });
};
