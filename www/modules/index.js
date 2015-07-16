/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    angular.module('app', ['ionic', 'ngCordova', 'app.auth', 'app.main', 'app.api', 'ngDraggable', 'ngImgCrop'])
        .config(appConfig)
        .service('connectionListener', connectionListener)
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

    appRun.$inject = ['$ionicPlatform', 'connectionListener'];
    function appRun($ionicPlatform, connectionListener) {
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
            connectionListener.listenConnection();
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

    connectionListener.$inject = ['$rootScope', 'appSocket'];
    function connectionListener($rootScope, appSocket) {

        var online = false;

        function setOffline() {
            if (online) {
                online = false;
                $rootScope.$broadcast('connection.off');
            }
        }

        function setOnline() {
            if (!online) {
                online = true;
                $rootScope.$broadcast('connection.on');
            }
        }

        this.listenConnection = function () {
            document.addEventListener("online", setOnline, false);
            document.addEventListener("offline", setOffline, false);
            appSocket.on('connect', setOnline);
            appSocket.on('disconnect',setOffline)
        };
    }
})(angular);