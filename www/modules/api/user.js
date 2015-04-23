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
            return $http.post(userEndpoint, params);
        };
        this.checkLoggedIn = function() {
            return $http.get(userEndpoint);
        };

        var settingsEndpoint = userEndpoint + '/profile';
        this.getSettings = function() {
            return $http.get(settingsEndpoint).then(function(res) { return res.data; });
        };

        this.saveSettings = function(settings) {
            return $http.put(settingsEndpoint, settings);
        };
    }

})(angular);