var File = require('../../util').File;
var Fixture = require('../../util').Fixture;
var jshint = require('../../../src');

var lint = function (opts) {
  return function (done) {
    var head = jshint.extract(opts.extract);
    var tail = head.pipe(jshint());

    var n = 0;
    tail.on('data', function (file) {
      n++;
      opts.eachFile(file);
    });

    tail.on('end', function () {
      n.should.eql(1);
      done();
    });

    head.write(opts.file);
    head.end();
  };
};

describe('with Script Extraction', function () {
  it('should fail with invalid script', lint({
    file: new Fixture('broken.html'),
    eachFile: function (file) {
      file.jshint.should.have.property('success', false);
      file.jshint.should.have.property('extracted');
    }
  }));

  it('should pass with valid script', lint({
    file: new Fixture('solid.html'),
    eachFile: function (file) {
      file.jshint.should.have.property('success', true);
      file.jshint.should.have.property('extracted');
    }
  }));

  it('should lint the actual HTML when arg is set to none', lint({
    extract: 'none',
    file: new Fixture('solid.html'),
    eachFile: function (file) {
      file.jshint.should.have.property('success', false);
      file.jshint.should.have.property('extracted');
      file.jshint.extracted.should.match(/^<!DOCTYPE html>/);
    }
  }));

  it('should obey the .jshintignore file', lint({
    file: new File({
      path: 'node_modules/module/docs/index.html',
      contents: (new Fixture('invalidScript.html')).contents
    }),
    eachFile: function (file) {
      file.should.not.have.property('jshint');
    }
  }));

  it('should pass for HTML file without any JS', lint({
    file: new Fixture('noScript.html'),
    eachFile: function (file) {
      file.jshint.should.have.property('success', true);
      file.jshint.should.have.property('extracted');
    }
  }));
});