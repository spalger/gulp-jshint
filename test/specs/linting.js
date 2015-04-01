var Fixture = require('../util').Fixture;
var PluginError = require('gulp-util').PluginError;
var jshint = require('../../src');

describe('linting', function () {
  it('should jshint two files', function (done) {
    var a = 0;

    var stream = jshint();
    stream.on('data', function () {
      ++a;
    });

    stream.once('end', function () {
      a.should.equal(2);
      done();
    });

    stream.write(new Fixture('undef'));
    stream.write(new Fixture('undef'));
    stream.end();
  });

  describe('custom linter', function () {
    var jshintSource;
    var oldSourceJSHINT;
    beforeEach(function() {
      jshintSource = require('jshint');
      oldSourceJSHINT = jshintSource.JSHINT;
    });
    afterEach(function() {
      jshintSource.JSHINT = oldSourceJSHINT;
    });
    it('should allow overriding jshint', function (done) {
      var count = 0;
      var stream = jshint({
        linter: function () {
          count ++;
          return true;
        }
      });

      stream.once('end', function () {
        count.should.equal(2);
        done();
      });

      stream.resume();
      stream.write(new Fixture('undef'));
      stream.write(new Fixture('undef'));
      stream.end();
    });
    it('should accept a require able string to a module with a JSHINT property', function (done) {
      var count = 0;

      // Mock out the jshint JSHINT function so we can spy on it
      jshintSource.JSHINT = function () {
        count ++;
        return true;
      };

      var stream = jshint({
        linter: 'jshint'
      });

      stream.once('end', function () {
        count.should.equal(2);
        done();
      });

      stream.resume();
      stream.write(new Fixture('undef'));
      stream.write(new Fixture('undef'));
      stream.end();      
    });
    it('should error with non-function', function () {
      var wrapper = function () {
        jshint({
          linter: {JSHINT: 'not-a-function'}
        });
      };
      wrapper.should.throw(PluginError);
    });
    it('should throw an error if there is the JSHINT property is not a function', function () {
      // make the JSHINT property on the module undefined,
      // mimicking a bad package
      jshintSource.JSHINT = undefined;

      var wrapper = function () {
        jshint({
          linter: 'jshint'
        });
      };
      wrapper.should.throw(PluginError);    
    });
  });
});
