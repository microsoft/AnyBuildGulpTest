//
// Root Gulp file for building the project code.
// Gulp home is at http://gulpjs.com/ 
//

"use strict";

const EventEmitter = require('events');

// Base Gulp library.
var gulp = require('gulp');

// Node.js's exec() for use in running command line tools.
var execCommand = require('child_process').exec;

// pump makes it easier to debug chains of Node.js streams.
// https://github.com/mafintosh/pump
var pump = require('pump');

// del allows cleaning up folders and files. 
const del = require('del');

// Helper method - allows recursive copying a directory structure.
// http://stackoverflow.com/questions/25038014/how-do-i-copy-directories-recursively-with-gulp#25038015
// 'finishedAsyncTaskCallback' param is optional and is the Gulp completion callback for asynchronous tasks.
// If specified it will be called after this method completes.
gulp.copy = (src, dest, finishedAsyncTaskCallback) => {
  return pump([
    gulp.src(src, { base:"." }),
    gulp.dest(dest)
  ], finishedAsyncTaskCallback);
};

// Gulp wrapper for running Mocha tests.
const mocha = require('gulp-mocha');

const gulpTypescript = require('gulp-typescript');
const tslint = require("gulp-tslint");
const sourcemaps = require('gulp-sourcemaps');

// Keep important paths here for reference. Only use Paths.Xxx in code below instead of duplicating these strings.
var Paths = {
  SourceRoot: 'src',

  // Test suites
  TestSuite1: 'src/test1',

  // Build output locations
  OutputRoot: 'out',
};

gulp.task('clean', () => {
  // Clean up output directories.
  return del([ Paths.OutputRoot ]);
});

gulp.task('tslint', () => {
  return gulp.src(Paths.SourceRoot + "/**/*.ts")
      .pipe(tslint({
        formatter: "verbose"
      }))
      .pipe(tslint.report())
});

let numTestSuites = 50
EventEmitter.defaultMaxListeners = numTestSuites + 10;

let buildTestSeries = []

for (let i = 0; i < numTestSuites; i++) {
  let suiteOutputPath = Paths.OutputRoot + `/tests-${i}`;

  let buildTaskName = `transpile-test-suite-${i}`;
  gulp.task(buildTaskName, () => {
    return gulp.src(Paths.TestSuite1 + '/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(gulpTypescript.createProject('tsconfig.json')())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(suiteOutputPath));
  });

  // http://andrewconnell.com/blog/running-mocha-tests-with-visual-studio-code
  let testTaskName = `run-test-suite-${i}`;
  gulp.task(testTaskName, () => {
    return gulp.src(suiteOutputPath + '/**/*.js', { read: false })
      .pipe(mocha({ reporter: 'spec' }));
  });

  buildTestSeries.push(gulp.series(buildTaskName, testTaskName))
}

// ---------------------------------------------------------------------------
// Primary entry point commands: Running 'gulp' cleans and runs build,
// 'build' is an alias for 'default' and required by Visual Studio Code
// integration.
// ---------------------------------------------------------------------------
gulp.task('default', gulp.series(
  'clean',

  gulp.parallel(buildTestSeries)
));
gulp.task('build', gulp.series('default'));
