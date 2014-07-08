var stream = require('../stream');
var PluginError = require('gulp-util').PluginError;

module.exports = function (config) {
  config = config || config;

  var fails = null;
  var buffer = config.buffer === false ? null : [];

  function error() {
    return new PluginError('gulp-jshint', {
      message: 'JSHint failed' + (fails ? ' for: ' + fails.join(', ') : ''),
      showStack: false
    });
  }

  return stream(
    function through(file) {
      // check for failure
      if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
        (fails = fails || []).push(file.path);
      }

      // if we failed, and we are not buffering files, emit error now
      if (fails && !buffer) this.emit('error', error());

      // push to either the buffer or the next stream
      (buffer || this).push(file);
    },
    function flush() {
      if (fails) {
        this.emit('error', error());
      } else if (buffer) {
        // send on the buffered files
        buffer.forEach(function (file) {
          this.push(file);
        }, this);
      }
    }
  );
};
