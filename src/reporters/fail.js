var stream = require('../stream');
var PluginError = require('gulp-util').PluginError;

module.exports = function (options) {
  var fails = null;
  var buffer = [];

  return stream(
    function through(file) {
      // check for failure
      if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
        (fails = fails || []).push(file.path);
        if (!options.downstream) {
          buffer = false;
        }
      }

      if (buffer) buffer.push(file);
    }, function flush() {
      if (fails) {
        this.emit('error', new PluginError('gulp-jshint', {
          message: 'JSHint failed for: ' + fails.join(', '),
          showStack: false
        }));
      }

      // send on the buffered files
      Array.isArray(buffer) && buffer.forEach(function (file) {
        this.push(file);
      }, this);
    }
  );
};
