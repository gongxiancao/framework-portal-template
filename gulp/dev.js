'use strict';

var gulp = require('gulp'),
  gulpLoadPlugins = require('gulp-load-plugins'),
  through = require('through'),
  gutil = require('gulp-util'),
  plugins = gulpLoadPlugins(),
  http = require('http'),
  _ = require('lodash'),
  merge = require('merge-stream'),
  wiredep = require('wiredep'),
  open = require('open'),
  gulpConfig = require('./gulp.json'),
  config,
  path = require('path'),
  serverPath = path.join(process.cwd(), 'server'),
  runSequence = require('run-sequence'),
  del = require('del');

function count(taskName, message) {
  var fileCount = 0;

  function countFiles(/*file*/) {
    fileCount++; // jshint ignore:line
  }

  function endStream() {
    gutil.log(gutil.colors.cyan(taskName + ': ') + fileCount + ' ' + message || 'files processed.');
    this.emit('end'); // jshint ignore:line
  }
  return through(countFiles, endStream);
}

function sortModulesFirst(a, b) {
    var module = /\.module\.js$/;
    var aMod = module.test(a.path);
    var bMod = module.test(b.path);
    // inject *.module.js first
    if (aMod === bMod) {
        // either both modules or both non-modules, so just sort normally
        if (a.path < b.path) {
            return -1;
        }
        if (a.path > b.path) {
            return 1;
        }
        return 0;
    } else {
        return (aMod ? -1 : 1);
    }
}

function checkAppReady(cb) {
  var options = {
    host: 'localhost',
    port: config.port,
    path: '/heartbeat'
  };
  http
    .get(options, function () {
      cb(true);
    })
    .on('error', function () {
      cb(false);
    });
}

// Call page until first success
function whenServerReady(cb) {
  var serverReady = false;
  var appReadyInterval = setInterval(function () {
    checkAppReady(function (ready) {
        if (!ready || serverReady) {
            return;
        }
        clearInterval(appReadyInterval);
        serverReady = true;
        cb();
    });
  },
  100);
}

function onServerLog(log) {
  console.log(plugins.util.colors.white('[') +
    plugins.util.colors.yellow('nodemon') +
    plugins.util.colors.white('] ') +
    log.message);
}

gulp.task('clean:tmp', function () {
  return del(['.tmp/*']);
});

gulp.task('jshint:server', function () {
  return gulp.src(gulpConfig.server.scripts)
    .pipe(plugins.jshint('.jshintrc_server'))
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    // .pipe(plugins.jshint.reporter('fail')) to avoid shutdown gulp by warnings
    .pipe(count('jshint', 'files lint free'));
});

gulp.task('jshint:client', function () {
  return gulp.src(gulpConfig.client.scripts)
    .pipe(plugins.jshint('.jshintrc_client'))
    .pipe(plugins.jshint.reporter('jshint-stylish'))
    // .pipe(plugins.jshint.reporter('fail')) to avoid shutdown gulp by warnings
    .pipe(count('jshint', 'files lint free'));
});

gulp.task('jshint', ['jshint:server', 'jshint:client']);


gulp.task('html2js', function () {
  return gulp.src(gulpConfig.client.modules, {base: 'client'})
    .pipe(plugins.foreach(function (stream, file) {
      var filename = path.basename(file.path);
      var moduleFileName = filename.replace(/.module.js$/, '');
      var moduleDir = path.dirname(file.path);

      var moduleName = moduleDir.replace(path.join(file.cwd, file.base) + '/', '').replace('/', '.');
      moduleName = moduleName.replace(/^app./, 'framework.');
      moduleName = moduleName.replace(/^components./, 'framework.com.');

      var destPath = moduleDir.replace(path.join(file.cwd, file.base), gulpConfig.tmp.scriptRoot);
      return gulp.src(path.join(moduleDir, '/**/*.tpl.html'))
        .pipe(plugins.html2js(moduleFileName + '.tpl.js', {
          adapter: 'angular',
          base: 'client',
          name: moduleName + '.tpl'
        }))
        .pipe(gulp.dest(destPath));
    }));
});


gulp.task('inject:client', function () {
  var target = gulp.src(gulpConfig.tmp.mainView);
  var sources = gulp.src(_.union(gulpConfig.tmp.scripts, gulpConfig.tmp.templates, gulpConfig.tmp.appStyles), {read: false})
    .pipe(plugins.sort(sortModulesFirst));
  var bowerSources = gulp.src(gulpConfig.tmp.bowerStyles, {read: false});

  return target.pipe(plugins.inject(sources, {ignorePath: '../../.tmp/public', relative: true}))
    .pipe(plugins.inject(bowerSources, {starttag: '<!-- inject:bower:{{ext}} -->', ignorePath: '../../.tmp/public', relative: true}))
    .pipe(gulp.dest(gulpConfig.tmp.publicRoot));
});

gulp.task('inject:server', function () {
  var target = gulp.src(gulpConfig.server.views);
  var sources = gulp.src(_.union(gulpConfig.tmp.scripts, gulpConfig.tmp.templates, gulpConfig.tmp.appStyles), {read: false})
    .pipe(plugins.sort(sortModulesFirst));
  var bowerSources = gulp.src(gulpConfig.tmp.bowerStyles, {read: false});

  return target.pipe(plugins.inject(sources, {ignorePath: '../../.tmp/public', relative: true}))
    .pipe(plugins.inject(bowerSources, {starttag: '<!-- inject:bower:{{ext}} -->', ignorePath: '../../.tmp/public', relative: true}))
    .pipe(gulp.dest(gulpConfig.server.viewsRoot));
});


gulp.task('wiredep:client', function () {
  var target = gulp.src(gulpConfig.tmp.mainView);
  return target.pipe(plugins.wiredep({
      exclude: [
      ],
      ignorePath: '../../client/',
      fileTypes: {
        html: {
          replace: {
            js: '<script src="js/{{filePath}}"></script>',
            css: '<link rel="stylesheet" href="styles/{{filePath}}">'
          }
        }
      }
    }))
    .pipe(gulp.dest(gulpConfig.tmp.publicRoot));
});


gulp.task('wiredep:server', function () {
  var target = gulp.src(gulpConfig.server.views);
  return target.pipe(plugins.wiredep({
      exclude: [
      ],
      ignorePath: '../../client/',
      fileTypes: {
        html: {
          replace: {
            js: '<script src="js/{{filePath}}"></script>',
            css: '<link rel="stylesheet" href="styles/{{filePath}}">'
          }
        }
      }
    }))
    .pipe(gulp.dest(gulpConfig.server.viewsRoot));
});

// gulp.task('default', function () {
//     gulp.src(gulpConfig.client.modules)
//         .pipe(plugins.html2js('angular.js', {
//             adapter: 'angular',
//             base: 'templates',
//             name: 'angular-demo'
//         }))
//         .pipe(gulp.dest('dist/'));
// });

gulp.task('copy:tmp:assets', function () {
  return merge(
    gulp.src(gulpConfig.client.assets, {base: 'client/assets'})
    .pipe(gulp.dest(gulpConfig.tmp.publicRoot)),
    gulp.src(gulpConfig.client.mainView, {base: 'client'})
    .pipe(gulp.dest(gulpConfig.tmp.publicRoot))
  );
});

gulp.task('copy:tmp:bower', function () {
  var bowerFiles = wiredep({
    exclude: [
    ],
    fileTypes: {
      font: {
        detect: {
          eot: /./,
          ttf: /./,
          svg: /./,
          woff: /./,
          woff2: /./
        }
      }
    }
  });
  return merge(
    gulp.src(bowerFiles.js, {base: 'client'})
      .pipe(gulp.dest(gulpConfig.tmp.scriptRoot)),
    gulp.src(_.union(bowerFiles.eot, bowerFiles.svg, bowerFiles.ttf, bowerFiles.woff, bowerFiles.woff2, bowerFiles.css), {base: 'client'})
      .pipe(gulp.dest(gulpConfig.tmp.styleRoot))
  );
});

gulp.task('copy:tmp:scripts', function () {
  var bowerFiles = wiredep();
  return gulp.src(gulpConfig.client.scripts, {base: 'client'})
    .pipe(gulp.dest(gulpConfig.tmp.scriptRoot));
});

gulp.task('less', function () {
  return gulp.src([gulpConfig.client.mainStyle, gulpConfig.client.bowerStyle])
    .pipe(plugins.lessSourcemap({
      sourceMap: {
        // sourceMapRootpath: '../less' // Optional absolute or relative path to your LESS files
      }
    }))
    .on('error', function (error) {
      plugins.util.log(plugins.util.colors.red(error.message));
    })
    .pipe(gulp.dest(gulpConfig.tmp.styleRoot));
});

gulp.task('start:client', function (cb) {
  whenServerReady(function () {
    open(config.serverUrl);
    cb();
  });
});

gulp.task('start:server', function () {
  process.env.NODE_ENV = process.env.NODE_ENV || 'development';
  config = require(serverPath + '/config/env/' + process.env.NODE_ENV);

  plugins.nodemon('-w server server')
    .on('log', onServerLog);
});

gulp.task('watch', function () {
    plugins.livereload.listen({port: 35739});

    plugins.watch(gulpConfig.client.styles, function () {
      runSequence('less');
    });

    plugins.watch(gulpConfig.tmp.appStyles)
      .pipe(plugins.plumber())
      .pipe(plugins.livereload());

    // plugins.watch(gulpConfig.client.views)
    //   .pipe(plugins.plumber())
    //   .pipe(plugins.livereload());

    // plugins.watch(gulpConfig.client.scripts) //['inject:js']
    //   .pipe(plugins.plumber())
    //   .pipe(transpileClient())
    //   .pipe(gulp.dest('.tmp'))
    //   .pipe(plugins.livereload());

    plugins.watch(gulpConfig.client.scripts) //['inject:js']
      .pipe(plugins.plumber())
      // .pipe(transpileClient())
      .pipe(gulp.dest(gulpConfig.tmp.scriptRoot))
      .pipe(plugins.livereload());

    plugins.watch(gulpConfig.client.locales)
      .pipe(plugins.plumber())
      // .pipe(transpileClient())
      .pipe(gulp.dest(gulpConfig.tmp.localeRoot))
      .pipe(plugins.livereload());

    plugins.watch(gulpConfig.client.templates, function () {
      runSequence('html2js');
    });

    plugins.watch(gulpConfig.tmp.templates) //['inject:js']
      .pipe(plugins.plumber())
      // .pipe(transpileClient())
      .pipe(plugins.livereload());

    // plugins.watch(_.union(gulpConfig.server.scripts, testFiles))
    //   .pipe(plugins.plumber())
    //   .pipe(lintServerScripts())
    //   .pipe(plugins.livereload());

    gulp.watch('bower.json', ['wiredep:client']);
});

gulp.task('migrate:up', function(cb) {
  require('../server/migrate.js').up(cb);
});

gulp.task('migrate:down', function(cb) {
  require('../server/migrate.js').down(cb);
});

var cucumber = require('gulp-cucumber');

gulp.task('cucumber', function() {
  return gulp.src('tests/features/*.feature').pipe(cucumber({
    steps: 'tests/features/step_definitions/*.js',
    support: 'tests/features/support/*js',
    format: 'pretty'
  }));
});

var protractor = require('gulp-protractor').protractor;

gulp.task('protractor', function () {
  return gulp.src(['tests/e2e/*.feature'])
    .pipe(protractor({
      configFile: 'tests/protractor-conf.js'
    }));
});

gulp.task('e2e', function (cb) {
  var spawn = require('child_process').spawn;
  var bash = spawn('bash', ['e2e.sh'], {cwd: process.cwd()});

  bash.stdout.pipe(process.stdout);
  bash.stderr.pipe(process.stderr);

  bash.on('close', function (/*code*/) {
    // console.log(`child process exited with code ${code}`);
    cb();
  });
});

gulp.task('build:dev', function (cb) {
  runSequence(
    ['jshint', 'clean:tmp'],
    ['copy:tmp:assets', 'copy:tmp:bower', 'copy:tmp:scripts', 'html2js', 'less'],
    ['inject:client', 'inject:server'],
    ['wiredep:client', 'wiredep:server'],
    cb);
});

gulp.task('development', function (cb) {
  runSequence(
    'build:dev',
    ['start:server', 'start:client', 'watch'],
    cb);
});

gulp.task('test', function (cb) {
  runSequence(
    'build:dev',
    'start:server',
    cb);
});
