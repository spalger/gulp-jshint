var _ = require('lodash');
var jshint = require('../');
var gutil = require('gulp-util');
var join = require('path').join;
var extname = require('path').extname;
var fs = require('fs');
var ROOT = join(__dirname, '..');
var array = function (obj) {
  return Array.isArray(obj) ? obj : [obj];
};

function File(opts) {
  if (!(this instanceof File)) return new File(opts);

  opts = opts || {};
  if (_.isString(opts)) {
    opts = { path: opts.replace(/^fixture\//, 'test/fixtures/') };
  }

  var path = join(ROOT, opts.path);
  var contents = opts.contents
    ? new Buffer(opts.contents, 'utf8')
    : fs.readFileSync(path);

  return new gutil.File({
    cwd: opts.cwd || ROOT,
    base: opts.base || ROOT,
    path: path,
    contents: contents
  });
}

function RcFile(path) {
  return JSON.parse(new File(path).contents.toString('utf8'));
}

function Fixture(name) {
  if (!extname(name)) name += '.js';
  return new File('fixture/' + name);
}

function RcFixture(name) {
  return new RcFile('fixture/' + name);
}

function lint(opts, cb) {
  var dataEvents = 0;
  opts.files = array(opts.file || opts.files);
  opts.args = array(opts.config || opts.args);

  var done = function (err) {
    stream.removeAllListeners('end');
    stream.removeAllListeners('error');
    cb(err);
  };

  var stream = jshint.apply(null, opts.args);

  stream.on('data', function (file) {
    dataEvents++;
    return opts.eachFile(file);
  });

  stream.once('end', function () {
    dataEvents.should.equal(opts.files.length);
    done();
  });

  stream.once('error', done);

  opts.files.forEach(function (file) {
    stream.write(file);
  });

  stream.end();

  return stream;
}

module.exports = {
  File: File,
  RcFile: RcFile,
  Fixture: Fixture,
  RcFixture: RcFixture,
  lint: lint
};