var through2ObjStr = require('through2').obj;
module.exports = function (handler, flush) {
  var str = through2ObjStr(function (obj, enc, _cb) {
    function done(err, obj) {
      if (err) str.emit('error', err);
      if (obj) str.push(obj);
      _cb();
    }

    if (handler.length >= 2) handler.call(str, obj, done);
    else {
      handler.call(str, obj);
      done();
    }
  }, flush);
  return str;
};