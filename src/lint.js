var RcLoader = require('rcloader');
var jshint = require('jshint').JSHINT;
var jshintcli = require('jshint/src/cli');

module.exports = function createLintFunction(userOpts) {

  var rcLoader = new RcLoader('.jshintrc', userOpts, {
    loader: function (path) {
      var cfg = jshintcli.loadConfig(path);
      delete cfg.dirname;
      return cfg;
    }
  });

  var reportErrors = function (file, out, cfg) {
    var filePath = (file.path || 'stdin');

    out.results = jshint.errors.map(function (err) {
      if (!err) return;
      return { file: filePath, error: err };
    }).filter(Boolean);

    out.opt = cfg;
    out.data = [jshint.data()];
    out.data[0].file = filePath;
  };

  return function lint(file, cb) {
    // pass through dirs, streaming files, etc.
    if (!file.isBuffer()) {
      return cb(null, file);
    }
    rcLoader.for(file.path, function (err, cfg) {
      if (err) return cb(err);

      var globals;
      if (cfg.globals) {
        globals = cfg.globals;
        delete cfg.globals;
      }

      // get or create file.jshint, we will write all output here
      var out = file.jshint || (file.jshint = {});
      var str = (out.extracted) || file.contents.toString('utf8');

      out.success = jshint(str, cfg, globals);
      if (!out.success) reportErrors(file, out, cfg);

      return cb(null, file);
    });
  };
};
