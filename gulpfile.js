var gulp = require('gulp'),
    php = require('gulp-connect-php'),
    browserSync = require('browser-sync').create();


// Variables
// -----------------------------------
var reload  = browserSync.reload;
var autoprefixerOptions = { browsers: ['last 2 versions', '> 5%']};

// Start PHP server
// -----------------------------------
gulp.task('php', function() {
    php.server({ base: './source', port: 8010});
});


// Load BrowserSync
// -----------------------------------
gulp.task('browser-sync', ['php'], function() {
    browserSync.init({
        proxy: '127.0.0.1:8010',
        port: 8080,
        open: true,
        notify: false,
        snippetOptions: {
          ignorePaths: ["./panel/**"]
        },
    });
});


// Serve | Launches Dev Environment
// (use this to work on your project)
// -----------------------------------
gulp.task('serve', ['browser-sync'], function() {
    gulp.watch('source/**.*').on('change', reload);
});

// Default Gulp Task | (change this to whatever you like)
// -----------------------------------
gulp.task('default', ['serve']);
