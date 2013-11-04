![status](https://secure.travis-ci.org/wearefractal/gulp-jshint.png?branch=master)

## Information

<table>
<tr> 
<td>Package</td><td>gulp-jshint</td>
</tr>
<tr>
<td>Description</td>
<td>JSHint plugin for gulp</td>
</tr>
<tr>
<td>Node Version</td>
<td>>= 0.4</td>
</tr>
</table>

## Usage

```javascript
var concat = require('gulp-jshint');

gulp.task('lint', function() {
  gulp.files('./lib/*.js')
    .pipe(jshint())
    .pipe(jshint.reporter('YOUR_REPORTER_HERE'));
});
```

## Options

You can pass in any options and it passes them straight to JSHint. Look at their README for more info.

## Results

Adds the following properties to the file object:

```javascript
  file.jshint.success = true; // or false
  file.jshint.errorCount = 0; // number of errors returned by JSHint
  file.jshint.results = []; // JSHint errors, see [http://jshint.com/docs/reporters/](http://jshint.com/docs/reporters/)
  file.jshint.data = []; // JSHint returns details about implied globals, cyclomatic complexity, etc
  file.jshint.opt = {}; // The options you passed to JSHint
```

## Reporters

You can choose any [JSHint reporter](https://github.com/jshint/jshint/tree/2.x/src/reporters)
when you call `.pipe(jshint.reporter('default'))` or you can use a simple reporter similar to
the default reporter: `.pipe(jshint.reporterSimple())`

## LICENSE

(MIT License)

Copyright (c) 2013 Fractal <contact@wearefractal.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
