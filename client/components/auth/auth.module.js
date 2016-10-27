'use strict';

angular.module('framework.com.auth', ['framework.com.user', 'ngCookies', 'framework.com.util'])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
