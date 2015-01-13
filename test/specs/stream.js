var stream = require('../../src/stream');

describe('custom through2 wrapper', function () {
  it('should make callbacks optional', function (done) {
    var a = 0;
    var b = 0;

    var s = stream(function () {
      a++;
      // discard all objects
    });

    s.pipe(
      stream(function () {
        // this should never be called
        b++;
      })
      .on('finish', function () {
        a.should.equal(1);
        b.should.equal(0);
        done();
      })
    );

    s.end({});
  });

  it('should timeout if the callback is never called', function (done) {
    stream({ timeout: 1 }, function (file, cb) {
      cb = null; // not going to call callback
    })
    .on('error', function (err) {
      err.message.should.match(/timeout/i);
      done();
    })
    .end({});
  });

  it('should call flush just before writing is finished', function (done) {
    var flushed = 0;

    var control = stream();

    control.pipe(
      stream(function () {}, function () {
        flushed ++;
      })
      .on('finish', function () {
        flushed.should.equal(1);
        done();
      })
    );

    control.end({});
  });
});