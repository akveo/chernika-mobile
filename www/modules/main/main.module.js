/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    angular.module('app.main', ['app.main.matches', 'app.main.settings', 'app.main.swiper', 'app.main.common', 'app.api'])
        .config(appConfig);

    appConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
    function appConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            // setup an abstract state for the tabs directive
            .state('main', {
                url: "/main",
                abstract: true,
                controller: mainController,
                templateUrl: "modules/main/mainLayout.html",
                resolve: {
                    userProfile: userProfileResolve
                }
            })
    }

    userProfileResolve.$inject = ['userApi', '$ionicLoading'];
    function userProfileResolve(userApi, $ionicLoading) {
        $ionicLoading.show();

        function onCheckedLogin(loginData) {
            $ionicLoading.hide();
            return loginData;
        }
        
        return userApi.checkLoggedIn()
            .then(onCheckedLogin, onCheckedLogin);
    }

    mainController.$inject = ['$rootScope', 'userProfile'];
    function mainController($rootScope, userProfile) {
        $rootScope.userProfile = userProfile;
        $rootScope.platformId = window.cordova ? (window.cordova.platformId == 'android' ? 'android' : 'ios') : 'desktop'
    }

})(angular);