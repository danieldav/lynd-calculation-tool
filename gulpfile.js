var gulp = require('gulp');
    plumber = require('gulp-plumber');
    //rename = require('gulp-rename');
var autoprefixer = require('gulp-autoprefixer');
//var babel = require('gulp-babel');
//var coffee = require('gulp-coffee');
//var concat = require('gulp-concat');
//var jshint = require('gulp-jshint');

var browserify  = require('browserify');
var babelify    = require('babelify');
var source      = require('vinyl-source-stream');
var buffer      = require('vinyl-buffer');
var sourcemaps  = require('gulp-sourcemaps');

var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
//var gzip = require('gulp-gzip');
var del = require('del');
var runSequence = require('run-sequence');
var tinypng = require('gulp-tinypng');
var svgmin = require('gulp-svgmin');
var imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache');
var cssnano = require('gulp-cssnano');
var less = require('gulp-less');
var browserSync = require('browser-sync').create();

gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
       baseDir: "src"
    }
  });
});

gulp.task('bs-reload', function () {
  browserSync.reload();
});

gulp.task('clean:dist', function() {
  return del.sync('dist');
})

// in order to clean the (image) cache: run 'gulp cache:clear'
gulp.task('cache:clear', function (callback) {
return cache.clearAll(callback)
})

gulp.task('minifyhtml', function() {
  return gulp.src('src/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    //.pipe(gzip())
    .pipe(gulp.dest('dist'))
});

gulp.task('svgmin', function () {
    return gulp.src('src/images/**/*.svg')
        .pipe(svgmin())
        .pipe(gulp.dest('dist/images/'));
});

gulp.task('images', function(){
  gulp.src('src/images/**/*.+(png|jpg)')
    .pipe(cache(tinypng('UTq9eYonuLa9yHXFJXh_9mbYfEsk05IO')))
    .pipe(cache(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images/'));
});

gulp.task('styles', function(){
  gulp.src(['src/less/**/*.less'])
    .pipe(plumber({
      errorHandler: function (error) {
        console.log(error.message);
        this.emit('end');
    }}))
    .pipe(less())
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('src/css/'))
    //.pipe(rename({suffix: '.min'}))
    //.pipe(cssnano())
    //.pipe(gulp.dest('dist/css/'))
    .pipe(browserSync.reload({
      stream:true
    }));
});



// gulp.task('build', ['minifyhtml','svgmin', 'images', 'fonts'], function (){
//   console.log('Building files');
// })


gulp.task('fonts', function() {
  return gulp.src('src/fonts/**/*')
  .pipe(gulp.dest('dist/fonts'))
})

gulp.task('scripts', function () {
    return browserify({entries: 'src/js/calculator.js', debug: true})
        .transform("babelify", { presets: ["es2015"] })
        .bundle()
        .pipe(source('calculator.js'))
        .pipe(buffer())
        .pipe(sourcemaps.init())
        .pipe(uglify())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('src/script'))
        .pipe(browserSync.reload({stream:true}));
});

gulp.task('nanocss', function() {
  gulp.src(['src/css/**/*.css'])
  //return gulp.src('src/script/**/*')
  .pipe(cssnano())
  .pipe(gulp.dest('dist/css/'))
})

gulp.task('script2dist', function() {
  gulp.src(['src/script/**/*.js'])
  //return gulp.src('src/script/**/*')
  .pipe(gulp.dest('dist/script'))
})
// gulp.task('scripts0', function(){
//   return gulp.src('src/js/**/*.+(coffee|js)')
//     .pipe(plumber({
//       errorHandler: function (error) {
//         console.log(error.message);
//         this.emit('end');
//     }}))
//     //.pipe(coffee({bare: true})
//     //.pipe(jshint())
//     //.pipe(jshint.reporter('default'))
//     //.pipe(concat('main.js'))
//     //.pipe(babel())
//     .pipe(gulp.dest('dist/js/'))
//     .pipe(rename({suffix: '.min'}))
//     .pipe(uglify())
//     //.pipe(gzip())
//     .pipe(gulp.dest('dist/js/'))
//     //.pipe(browserSync.reload({stream:true})));
//     .pipe(browserSync.reload({stream:true}));
// });


gulp.task('default', ['styles','scripts','browser-sync'], function(){
  gulp.watch("src/less/**/*.less", ['styles','bs-reload']);
  gulp.watch("src/js/**/*.+(js|coffee)", ['scripts']);
  gulp.watch("src/**/*.html", ['bs-reload']);
});

// If this produces error like: 'Error: EPERM: operation not permitted'
// then
// 0) Manually delete the dist folder with unlocker
// 1) install npm globally as admin,
// 2) run: npm cache clean
// 3) Disable antivirus
//https://github.com/Medium/phantomjs/issues/19
// NB: option 0) 2) or 3) may work by themselves.


// When ready for production - just run: gulp build-production
// and the dist folder and files will be created.
gulp.task('build-production', function (callback) {
  runSequence('clean:dist',
    ['minifyhtml','svgmin', 'images', 'fonts','nanocss','script2dist'],
    callback
  )
})
