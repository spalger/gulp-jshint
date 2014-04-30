var fs = require('fs');
var minimatch = require('minimatch');
var resolve = require('path').resolve;
var RcLoader = require('rcloader');

var ignoreLoader = new RcLoader('.jshintignore', {}, {
  loader: function (path, done) {
    // .jshintignore is a line-delimited list of patterns
    // convert to an array and filter empty lines
    fs.readFile(path, function (err, contents) {
      if (err) return done(err);
      done(null, {
        patterns: contents.toString('utf8')
          .split(/\r?\n/)
          .filter(function (line) { return !!line.trim(); })
      });
    });
  }
});

module.exports = function check(file, cb) {
  ignoreLoader.for(file.path, function (err, cfg) {
    var ignored = false;

    if (Array.isArray(cfg.patterns)) {
      ignored = cfg.patterns.some(function (pattern) {

        if (minimatch(resolve(file.path), pattern, { nocase: true })) {
            return true;
        }

        if (file.path === resolve(pattern)) {
            return true;
        }

        return (fs.existsSync(file.path) && fs.lstatSync(file.path).isDirectory() &&
          pattern.match(/^[^\/]*\/?$/) && file.path.match(new RegExp("^" + pattern + ".*")));
      });
    }

    return cb(null, ignored);
  });
};

