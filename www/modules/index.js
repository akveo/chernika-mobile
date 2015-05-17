/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    angular.module('app', ['ionic', 'ngCordova', 'app.auth', 'app.main', 'app.api'])
        .config(appConfig)
        .run(appRun)
        .controller('SplashController', SplashController);

    appConfig.$inject = ['$urlRouterProvider', '$stateProvider', '$ionicConfigProvider'];
    function appConfig($urlRouterProvider, $stateProvider, $ionicConfigProvider) {
        $urlRouterProvider.otherwise('/splash');

        $stateProvider
            .state('splash', {
                url: '/splash',
                template: '<ion-view hide-nav-bar="true"></ion-view>',
                controller: 'SplashController'
            });
        //$ionicConfigProvider.tabs.position('bottom');
    }

    appRun.$inject = ['$ionicPlatform'];
    function appRun($ionicPlatform) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                // cordova.plugins.Keyboard.disableScroll(true);
            }
            if (window.StatusBar) {
                // org.apache.cordova.statusbar required
                StatusBar.styleDefault();
            }
        });
    }

    SplashController.$inject = ['userApi', '$state'];
    function SplashController(userApi, $state) {
        userApi.checkLoggedIn()
            .then(function() {
                $state.go('main.swiper');
            }, function() {
                $state.go('login');
            });
    }
})(angular);