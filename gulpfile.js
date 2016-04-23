var gulp        = require('gulp')
var babel       = require('gulp-babel')
var coffee      = require('gulp-coffee')
var concat      = require('gulp-concat')
var filter      = require('gulp-filter')
var plumber     = require('gulp-plumber')
var rename      = require('gulp-rename')
var rollup      = require('gulp-rollup')
var sourcemaps  = require('gulp-sourcemaps')
var uglify      = require('gulp-uglify')
var gutil       = require('gulp-util')
var del         = require('del')
var coffeescript = require('rollup-plugin-coffee-script')

const CONFIG = {
  sourceGlob: './src/**/*.js',
  entryFile: './src/tangojs-connector-local.js',
  targetDir: './lib',
  packageName: 'tangojs-connector-local.js',
  modelSource: './src/demo-model.coffee',
  modelPackageName: 'tangojs-demo-model.js'
}

/**
 * Default task.
 */
gulp.task('default', ['compile'])

/**
 * Deletes target directory.
 */
gulp.task('clean', () =>
  del(CONFIG.targetDir)
)

/**
 * Transpiles and bundles the library.
 */
gulp.task('compile', () =>
  gulp.src(CONFIG.entryFile, {read: true})
    .pipe(plumber(function (error) {
      gutil.log(error)
      this.emit('end')
    }))
    .pipe(rollup({
      format: 'umd',
      moduleName: 'tangojsConnectorLocal',
      external: ['tangojs-core'],
      globals: {
        'tangojs-core': 'tangojs'
      },
      sourceMap: true
    }))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(CONFIG.targetDir))
)

gulp.task('model:compile', () =>
  gulp.src(CONFIG.modelSource, {read: true})
    .pipe(rollup({
      format: 'umd',
      moduleName: 'demoModel',
      external: ['tangojs-core'],
      globals: {
        'tangojs-core': 'tangojs'
      },
      entry: CONFIG.modelSource,
      plugins: [
        coffeescript()
      ]
    }))
    .pipe(concat(CONFIG.modelPackageName))
    .pipe(gulp.dest(CONFIG.targetDir))
)

/**
 * Trigger compilation when any of .js files changes.
 */
gulp.task('watch', ['compile', 'model:compile'], () =>
  gulp.watch([CONFIG.sourceGlob], ['compile'])
)
