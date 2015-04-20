/**
 * Created by vl on 20.4.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.api')
        .service('userApi', userApi);


    userApi.$inject = ['$http', 'appConfig'];
    function userApi($http, appConfig) {

        var userEndpoint = appConfig.api.endpoint + 'user';
        this.login = function(params) {
            return $http.post(userEndpoint)
        };

        this.checkLoggedIn = function() {
            return $http.get(userEndpoint);
        };
    }

})(angular);