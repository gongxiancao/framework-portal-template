'use strict';

/* App Module */
angular.module('framework', [
  'framework.home',
  'framework.main',
  'framework.com.disable-animation',
  'ngResource',
  'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'pascalprecht.translate'
])
.config(function($locationProvider, $urlRouterProvider, $stateProvider, $translateProvider, $compileProvider) {
  // languages
  $translateProvider.useStaticFilesLoader({
    prefix: '/locales/',
    suffix: '.json'
  });

  $translateProvider.preferredLanguage('zh-cn');

  // allow blob in image src
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|blob):|data:image\//);
  $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|tel|file|blob):/);

  // $compileProvider.debugInfoEnabled(false);

  $urlRouterProvider.rule(function ($injector, $location) {

    var path = $location.path();
    var hasTrailingSlash = path[path.length-1] === '/';

    if(hasTrailingSlash) {

      //if last charcter is a slash, return the same url without the slash
      var newPath = path.substr(0, path.length - 1);
      return newPath;
    }
  });
})
.run(function ($rootScope, $state, $stateParams) {
  $rootScope.initialingServiceCount = $rootScope.initialingServiceCount || 0;
  $rootScope.initialingServiceCount += 1;
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$on('$translateLoadingSuccess', function () {
    $rootScope.initialingServiceCount -= 1;
  });
});
