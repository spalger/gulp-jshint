var File = require('../../util').File;
var Fixture = require('../../util').Fixture;
var RcFixture = require('../../util').RcFixture;
var jshint = require('../../../src');

describe('overrides option', function () {
  it('should override the config when matching patterns are found', function (done) {
    var contents = Fixture('undef').contents;
    var jshintrc = new RcFixture('.jshintrc');

    jshintrc.overrides = {
      "*Indent4.js": {
        "indent": 4
      },
      "*Indent8.js": {
        "indent": 8
      }
    };

    var stream = jshint(jshintrc);
    stream.on('data', function (file) {
      if (file.relative === "test/fixture/fileIndent4.js") {
        file.jshint.opt.indent.should.equal(4);
      }

      if (file.relative === "test/fixture/fileIndent8.js") {
        file.jshint.opt.indent.should.equal(8);
      }
    });

    stream.once('end', function () {
      done();
    });

    stream.write(new File({ path: './test/fixture/fileIndent4.js', contents: contents }));
    stream.write(new File({ path: './test/fixture/fileIndent8.js', contents: contents }));
    stream.end();
  });
});
