var gulp = require('gulp');
var webpack = require('webpack');
var gulpWebpack = require('gulp-webpack');
var server = require('gulp-express');
var connect = require('gulp-connect');
var browserSync = require('browser-sync').create();

gulp.task('connect', function () {
    connect.server({
        root: './public/',
        livereload: true,
    });
});

gulp.task('webpack', function () {
    return gulp.src('./public/js/*.js')
        .pipe(gulpWebpack(require('./webpack.config'), webpack))
        .pipe(gulp.dest('public/dist/js'))
        .pipe(connect.reload());
});

gulp.task('serve', function () {
    server.run(['./bin/www']);
});

gulp.task('watch', function () {
    gulp.watch(['./public/js/*.js'], ['webpack']);
});


gulp.task('default', ['connect', 'webpack', 'serve', 'watch']);

