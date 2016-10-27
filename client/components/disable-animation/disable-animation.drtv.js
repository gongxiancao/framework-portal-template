'use strict';

angular.module('framework.com.disable-animation', []).directive('disableAnimation', function ($animate) {
  return {
    restrict: 'A',
    link: function(scope, element){
      $animate.enabled(false, element);
    }
  };
});