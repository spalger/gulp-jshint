var through2 = require('through2');

module.exports = function (handler, flush) {
  // if a handler leaves off the done callback, we will call it for them
  var async = handler.length >= 2;

  var str = through2({ objectMode: true }, function (obj, enc, _cb) {
    var done = function (err, obj) {
      if (err) str.emit('error', err);
      if (obj) str.push(obj);

      _cb();
    };


    if (async) {
      handler.call(str, obj, done);
    } else {
      handler.call(str, obj);
      done();
    }
  }, flush);

  return str;
};