'use strict';

angular.module('framework.com.auth')
  .service('Auth', function (User, $q, $http, $location, $cookies) {
    var currentUser;
    var Auth = this;

    this.createUser = function (user) {
      return new User(user).$save();
    };

    this.login = function (user) {
      return $http.post('/api/v1/auth/access-token', {
        username: user.username,
        password: user.password
      })
        .then(function (res) {
          $cookies.put('token', res.data.accessToken);
          currentUser = User.get();
          return currentUser.$promise;
        })
        .catch(function (err) {
          Auth.logout();
          return $q.reject(err.data);
        });
    };

    this.logout = function () {
      $cookies.remove('token');
      currentUser = {};
    };

    this.getCurrentUser = function () {
      return currentUser;
    };

    this.authenticate = function () {
      if (!currentUser){
        // get user info from DB when visit page at the first time.
        currentUser = User.get();
      }
    };
  });
