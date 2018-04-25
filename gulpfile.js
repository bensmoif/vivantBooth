var gulp = require('gulp');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require( 'gulp-util' );

var fileGlobsToWatch = [
	'src/**',
	'css/**',
	'js/**',
	'fonts/**',
	'*.css'
];

//Sass builder
gulp.task('styles', function() {
    gulp.src('sass/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass().on('error', sass.logError))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest('./css/'))
});

//Watch task
gulp.task('default',function() {
    gulp.watch('sass/**/*.scss',['styles']);
});
