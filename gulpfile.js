let project_folder = 'build'
let source_folder = 'src'

let path = {
    build: {
        html: project_folder + '/',
        css: project_folder + '/css/',
        js: project_folder + '/js/',
        img: project_folder + '/img/',
        fonts: project_folder + '/fonts/',
    },
    src: {
        html: [source_folder + '/*.html', '!' + source_folder + '/_*.html'],
        css: source_folder + '/scss/style.scss',
        js: source_folder + '/js/scripts.js',
        img: source_folder + '/img/**/*.+(png|jpg|jpeg|ico|svg|webp)',
        fonts: source_folder + '/fonts/*',
    },
    watch: {
        html: source_folder + '/**/*.html',
        css: source_folder + ['/scss/**/*.scss'],
        js: source_folder + '/js/**/*.js',
        img: source_folder + '/img/**/*.+(png|jpg|jpeg|ico|svg|webp)',
        fonts: source_folder + '/fonts/*',
    },
    clean: './' + project_folder + '/',
}

let { src, dest } = require('gulp'),
    gulp = require('gulp'),
    browsersync = require('browser-sync').create(),
    fileinclude = require('gulp-file-include'),
    del = require('del'),
    scss = require('gulp-sass')(require('sass')),
    autoprefixer = require('gulp-autoprefixer'),
    group_media = require('gulp-group-css-media-queries'),
    clean_css = require('gulp-clean-css'),
    rename = require('gulp-rename'),
    uglify = require('gulp-uglify-es').default,
    imagemin = require('gulp-imagemin')

// Browser Sync
function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: './' + project_folder + '/',
        },
        port: 3000,
        notify: false,
    })
}

// HTML
function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(dest(path.build.html))
        .pipe(browsersync.reload({ stream: true }))
}

// Images
function img() {
    return src(path.src.img).pipe(imagemin({progressive: true})).pipe(dest(path.build.img)).pipe(browsersync.stream())
}

// Fonts
function fonts() {
    return src(path.src.fonts).pipe(dest(path.build.fonts)).pipe(browsersync.stream())
}

// Images Compress
// function img() {
//     return src(path.src.img)
//         .pipe(
//             imagemin([
//                 imagemin.gifsicle({ interlaced: true }),
//                 imagemin.mozjpeg({ quality: 80, progressive: true }),
//                 imagemin.optipng({ optimizationLevel: 5 }),
//                 imagemin.svgo({
//                     plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
//                 }),
//             ]),
//         )
//         .pipe(dest(path.build.img))
// }

// JavaScript
function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: '.min.js',
            }),
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream())
}

// CSS
function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: 'expanded',
            }),
        )
        .pipe(group_media())
        .pipe(
            autoprefixer({
                cascade: true,
                overrideBrowserslist: ['last 5 versions'],
            }),
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: '.min.css',
            }),
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream())
}

// Watch Files
function watchFiles(params) {
    gulp.watch([path.watch.html], {usePolling: true}, gulp.series('html'))
    gulp.watch([path.watch.css], {usePolling: true}, gulp.series('css'))
    gulp.watch([path.watch.js], {usePolling: true}, gulp.series('js'))
    gulp.watch([path.watch.img], {usePolling: true}, gulp.series('img'))
    gulp.watch([path.watch.fonts], {usePolling: true}, gulp.series('fonts'))
}

// Clean
function clean(params) {
    return del(path.clean)
}

// let build = gulp.series(clean, gulp.parallel(html, js, css, images, fonts))

// Without clean build
let build = gulp.series(gulp.parallel(html, js, css, img, fonts))
let watch = gulp.parallel(build, watchFiles, browserSync)

exports.img = img
// exports.images = images
exports.js = js
exports.html = html
exports.css = css
exports.fonts = fonts
exports.build = build
exports.watch = watch
exports.default = watch
