var stream = require('../stream');

module.exports = function () {
  return stream(
    function through(file) {
      if (file.jshint && !file.jshint.success && !file.jshint.ignored) {
        process.exit(1);
      }
    },
    function flush() {
    }
  );
};
