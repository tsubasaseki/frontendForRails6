'use strict'

import gulp from 'gulp';
import sass from 'gulp-sass';
import sourcemaps from 'gulp-sourcemaps';
import minifyCss from 'gulp-minify-css';
import babel from 'gulp-babel';
import browserSync from 'browser-sync';

import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssDeclarationSorter from 'css-declaration-sorter';

import webpackStream from 'webpack-stream';
import webpack from 'webpack';

import rename from 'gulp-rename';
import uglify from 'gulp-uglify';

const webpackConfig = require('./webpack.config');

const rootDir = `./public`
const srcDir = `./src`
const mapDir = './maps'
const path = {
    all: `${rootDir}/*`,
    html: `${rootDir}/**/*.html`,
    styles: {
        src: `${srcDir}/scss/**/*.scss`,
        dest: `${rootDir}/assets/css`
    },
    js: {
        src: `${srcDir}/js/**/*.js`,
        dest: `${rootDir}/assets/js`
    },
    mjs: {
        src: `${srcDir}/mjs/**/*.mjs`,
        dest: `${rootDir}/assets/js`
    }
};

const style = () => {
    const plugin = [
        autoprefixer({
            browsers: [
                'last 2 versions'
            ]
        }),
        cssDeclarationSorter({
            order: 'smacss'
        })
    ];

    return gulp.src(path.styles.src)
        .pipe(sourcemaps.init())
        .pipe(sass({
            includePaths: './node_modules/bootstrap/scss',
            outputStyle: 'expanded'
        })) // DON'T use sass option {outputStyle: 'compressed'} the reason is that the map is slip
        .pipe(gulp.dest(path.styles.dest))
        .pipe(postcss(plugin))
        .pipe(rename({extname:'.pre.css'}))
        .pipe(gulp.dest(path.styles.dest))
        .pipe(rename(function (path) {
            path.basename = path.basename.replace(/\.pre$/, '');
        }))
        .pipe(minifyCss({advanced:false}))
        .pipe(sourcemaps.write(mapDir))
        .pipe(rename({extname:'.min.css'}))
        .pipe(gulp.dest(path.styles.dest))
}
const js = () => {
    return gulp.src(path.js.src)
        .pipe(babel())
        .pipe(gulp.dest(path.js.dest))
}

const mjs = () => {
    return webpackStream(webpackConfig, webpack)
        .pipe(gulp.dest(path.mjs.dest))
        .pipe(uglify())
        .pipe(rename({extname:'.min.js'}))
        .pipe(gulp.dest(path.mjs.dest))
}

const server = browserSync.create();
const reload = (done) => {
    server.reload();
    done();
};
const serve = (done) => {
    server.init({
        server: {
            baseDir: rootDir
        }
    });
    done();
};

const watch = () => {
    gulp.watch(path.styles.src, style)
    gulp.watch(path.js.src, js)
    gulp.watch(path.mjs.src, mjs)
    gulp.watch([
        path.html,
        path.styles.dest + '/*.css',
        `${path.js.dest}/*.js`,
        path.mjs.dest + '/*.js'
    ], reload)
};

export default gulp.series(serve, watch);