const gulp = require('gulp');
const ts = require('gulp-typescript');
const rename = require('gulp-rename');
const log = require('gulp-log');
const chalk = require('chalk');

// Define the TypeScript project
const tsProject = ts.createProject('tsconfig.json');

// Function to print formatted messages
function logMessage(message) {
    console.log(chalk.green('===> ' + message));
}

// Task for TypeScript compilation
gulp.task('compile', () => {
    logMessage('Compiling TypeScript files...');
    return tsProject.src()
        .pipe(tsProject())
        .pipe(gulp.dest('dist'))
        .pipe(log({ message: 'TypeScript files compiled!', showFiles: false }));
});

// Task to copy HTML files
gulp.task('copy-html', () => {
    logMessage('Copying HTML files...');
    return gulp.src('src/*.html')
        .pipe(gulp.dest('dist'))
        .pipe(log({ message: 'HTML files copied!', showFiles: false }));
});

// Task to copy individual CSS files
gulp.task('copy-css', () => {
    logMessage('Copying CSS files...');
    return gulp.src('src/styles/*.css')
        .pipe(gulp.dest('dist/styles'))
        .pipe(log({ message: 'CSS files copied!', showFiles: false }));
});

// Define the build task that runs compile, copy-html, and copy-css tasks
gulp.task('build', gulp.series('compile', 'copy-html', 'copy-css'));

// Default task
gulp.task('default', gulp.series('build'));
