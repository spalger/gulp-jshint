var es = require('event-stream'),
  jshint = require('jshint').JSHINT;

module.exports = function(opt){
  return es.map(function (file, cb) {
    var success = jshint(String(file.contents), opt);

    // send status down-stream
    file.jshintSuccess = success;
    file.jshintErrors = 0;

    var data = [jshint.data()];
    data[0].file = file.path;
    file.jshintData = data;

    if (!success) {
      var results = jshint.errors.filter(function (err) {
        return err;
      }).map(function (err) {
        return {
          file: file.path,
          error: err,
          mess: file.path + ': line ' + err.line + ', col ' + err.character + ', code ' + err.code + ', ' + err.reason
        };
      });

      // send status down-stream
      file.jshintResults = results;
      file.jshintErrors = results.length;
    }

    cb(null, file);
  });
};
