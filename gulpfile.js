'use strict';

const gulp =  require('gulp');
const style = require('gulp-sass');
const cssmin = require('gulp-minify-css');
const cssnano = require('gulp-cssnano');
const sourcemaps = require('gulp-sourcemaps');
const autoprefixer = require('gulp-autoprefixer');
const rigger = require('gulp-rigger');
const gulpIf = require('gulp-if');
const del = require('del');
const newer = require('gulp-newer');
const notify = require('gulp-notify');
const plumber = require('gulp-plumber');
const imagemin = require('gulp-imagemin');
const pngquant = require('imagemin-pngquant');
const uglify = require('gulp-uglify');
const uncss = require('gulp-uncss');
const rev = require('gulp-rev');
const revReplace = require('gulp-rev-replace');
const browserSync = require('browser-sync').create();

//Path
//--------------------------
var path = {
  src: { //Where to get the files
    html: 'dev/html/pages/*.html',
    htmlAll: 'dev/html/**/*.html',
    style: 'dev/scss/main.scss',
    js: 'dev/js/main.js',
    img: 'dev/img/**/*.*',
    fonts: 'dev/fonts/**/*.*'
  },
  build: { //Where to put the files after assembly
    html: 'app/html/',
    style: 'app/css/',
    js: 'app/js/',
    img: 'app/img/',
    fonts: 'app/fonts/'
  },
  watch: { //The change which files we want to observe
      html: 'dev/html/**/*.html',
      js: 'dev/js/**/*.js',
      style: 'dev/scss/**/*.scss',
      img: 'dev/img/**/*.*',
      fonts: 'dev/fonts/**/*.*'
  },
  app:{
    app: 'app'
  }
};

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

// HTML
//--------------------------
gulp.task('html', function() {
    return gulp.src(path.src.html)
          .pipe(rigger())
          .pipe(gulp.dest(path.build.html));
});

// Style
//--------------------------
gulp.task('style', function() {
    return gulp.src(path.src.style)
          .pipe(plumber())
          .pipe(gulpIf(isDevelopment, sourcemaps.init()))
          .pipe(style())
          .on('error', notify.onError(function(err) {
            return {
              title: 'Styles',
              message: err.message
            };
          }))
          .pipe(autoprefixer({
            browsers: ['last 2 versions']
          }))
          .pipe(gulpIf(!isDevelopment, uncss({
            html: [path.src.htmlAll]
          })))
          .pipe(gulpIf(!isDevelopment, cssmin()))
          .pipe(gulpIf(isDevelopment, sourcemaps.write()))
          .pipe(gulp.dest(path.build.style))
});

// JavaScript
//--------------------------
gulp.task('js', function() {
    return gulp.src(path.src.js)
          .pipe(rigger())
          .pipe(gulpIf(isDevelopment, sourcemaps.init()))
          .pipe(gulpIf(!isDevelopment, uglify()))
          .pipe(gulpIf(isDevelopment, sourcemaps.write()))
          .pipe(gulp.dest(path.build.js))
});

// Image
//--------------------------
gulp.task('images', function() {
    return gulp.src(path.src.img, {since: gulp.lastRun('images')})
          .pipe(newer(path.build.img))
          .pipe(imagemin({
              progressive: true,
              svgoPlugins: [{removeViewBox: false}],
              use: [pngquant()],
              interlaced: true
          }))
          .pipe(gulp.dest(path.build.img));
});

// Font
//--------------------------
gulp.task('fonts', function() {
    return gulp.src(path.src.fonts, {since: gulp.lastRun('fonts')})
          .pipe(newer(path.build.fonts))
          .pipe(gulp.dest(path.build.fonts));
});

// Clean
//--------------------------
gulp.task('clean', function() {
    return del(path.app.app);
});

// Build
//--------------------------
gulp.task('build', gulp.series(
  'clean',
  gulp.parallel('html', 'style', 'js', 'images', 'fonts'))
);

// Watch
//--------------------------
gulp.task('watch', function() {
  gulp.watch(path.src.html, gulp.series('html'));
  gulp.watch(path.src.style, gulp.series('style'));
  gulp.watch(path.src.js, gulp.series('js'));
  gulp.watch(path.src.img, gulp.series('images'));
  gulp.watch(path.src.fonts, gulp.series('fonts'));
});

// Browser-sync
//--------------------------
gulp.task('serve', function() {
  browserSync.init({
    server: {
        baseDir: './' + path.app.app
    },
    startPath: "/html",
  });

  browserSync.watch(path.app.app).on('change', browserSync.reload);
});

// Dev task
//--------------------------
gulp.task('dev',
    gulp.series('build', gulp.parallel('watch', 'serve'))
);
