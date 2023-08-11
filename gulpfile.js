const gulp = require('gulp');
const ts = require('gulp-typescript');
const chalk = require('chalk');
const replace = require('gulp-replace');

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
});

gulp.task('copy-html', () => {
    logMessage('Copying HTML files...');
    return gulp.src('src/*.html')
        .pipe(replace(/\.ts/g, '.js'))
        .pipe(gulp.dest('dist'))
});

// Task to copy individual CSS files
gulp.task('copy-css', () => {
    logMessage('Copying CSS files...');
    return gulp.src('src/styles/*.css')
        .pipe(gulp.dest('dist/styles'))
});

// Task to copy font files
gulp.task('copy-fonts', () => {
    logMessage('Copying font files...');
    return gulp.src('src/fonts/*.*')
        .pipe(gulp.dest('dist/fonts'))
});

// Define the build task that runs compile, copy-html, and copy-css tasks
gulp.task('build', gulp.series('compile', 'copy-html', 'copy-css', 'copy-fonts'));

// Default task
gulp.task('default', gulp.series('build'));
