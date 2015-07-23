/**
 * Created by vl on 20.4.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.api')
        .service('userApi', userApi)
        .service('profilesApi', profilesApi);


    userApi.$inject = ['$http', 'appConfig'];
    function userApi($http, appConfig) {

        var userEndpoint = appConfig.api.endpoint + 'user';
        this.login = function(params) {
            return $http.post(userEndpoint, params);
        };
        this.checkLoggedIn = function() {
            return $http.get(userEndpoint).then(function(res) { return res.data; });
        };

        var photosEndpoint = userEndpoint + '/photos';
        this.getPhotos = function() {
            return $http.get(photosEndpoint).then(function(res) { return res.data; });;
        };

        this.savePhotos = function(photos) {
          return $http.put(photosEndpoint, {photos: photos});
        };

        this.addDevice = function (deviceInfo) {
            return $http.put(userEndpoint + '/devices', {device: deviceInfo});
        };

        var settingsEndpoint = userEndpoint + '/settings';
        this.getSettings = function() {
            return $http.get(settingsEndpoint).then(function(res) { return res.data; });
        };

        this.saveSettings = function(settings) {
            return $http.put(settingsEndpoint, settings);
        };
    }

    profilesApi.$inject = ['$http', 'appConfig'];
    function profilesApi($http, appConfig) {
        var profileEndpoint = appConfig.api.endpoint + 'profile';
        this.getProfileData = function(profileId) {
            return $http.get(profileEndpoint + '/' + profileId).then(function(res) { return res.data; });
        };

        this.getProfileInfo = function (profileId) {
            return $http.get(profileEndpoint + '/' + profileId + '/info').then(function(res) { return res.data; });
        }
    }

})(angular);