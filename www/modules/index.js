/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    angular.module('app', ['ionic', 'ngCordova', 'ngIOS9UIWebViewPatch', 'ionic.service.core', 'ionic.service.push', 'ionic.service.analytics', 'app.auth', 'app.main', 'app.api', 'app.notify', 'ngDraggable', 'ngImgCrop'])
      .config(appConfig)
      .service('connectionListener', connectionListener)
      .service('appStateListener', appStateListener)
      .run(appRun)
      .run(googleAnalyticsRun)
      .run(ionicAnalyticsRun)
      .controller('SplashController', SplashController);

    'use strict';

    appConfig.$inject = ['$urlRouterProvider', '$stateProvider', '$ionicAppProvider', 'appConfig', '$ionicConfigProvider'];
    function appConfig($urlRouterProvider, $stateProvider, $ionicAppProvider, appConfig, $ionicConfigProvider) {
        $urlRouterProvider.otherwise('/splash');

        $stateProvider
            .state('splash', {
                url: '/splash',
                template: '<ion-view hide-nav-bar="true"></ion-view>',
                controller: 'SplashController'
            });

        $ionicAppProvider.identify({
            app_id: appConfig.ionic.appId,
            api_key: appConfig.ionic.apiKey,
            gcm_id: appConfig.ionic.gcmId,
            dev_push: appConfig.ionic.devPush
        });

        $ionicConfigProvider.platform.ios.backButton.text('назад');
    }

    appRun.$inject = ['$ionicPlatform', 'connectionListener', 'PushInitializer', 'IonicUserInitializer', 'appStateListener', '$ionicConfig', '$rootScope', 'appBack'];
    function appRun($ionicPlatform, connectionListener, PushInitializer, IonicUserInitializer, appStateListener, $ionicConfig, $rootScope, appBack) {
        $ionicPlatform.ready(function() {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
                cordova.plugins.Keyboard.disableScroll(true);
            }

            appBack.init({
                mainState: 'main.swiper',
                toMainStates: ['main.matches', 'main.settings'],
                toHomeStates:['main.swiper', 'login']
            });

            $ionicConfig.views.swipeBackEnabled(false);
            connectionListener.listenConnection();
            appStateListener.listenState();
            PushInitializer.init();
            IonicUserInitializer.init();
        });
    }

    SplashController.$inject = ['userApi', '$state', '$ionicPlatform'];
    function SplashController(userApi, $state, $ionicPlatform) {
        userApi.checkLoggedIn()
            .then(function() {
                $ionicPlatform.ready(function() {
                    $state.go('main.swiper');
                });
            }, function() {
                $ionicPlatform.ready(function() {
                    $state.go('login');
                });
            }); 
        
        
    }

    connectionListener.$inject = ['$rootScope', 'appSocket'];
    function connectionListener($rootScope, appSocket) {
        var self = this;

        self.online = false;
        self.paused = false;
        self.ignoreSocketDisconnect = false;

        function setOffline() {
            if (self.online) {
                self.online = false;
                $rootScope.$broadcast('connection.off');
            }
        }

        function setOnline() {
            if (!self.online) {
                forceOnline();
            }
        }

        function forceOnline() {
            self.online = true;
            $rootScope.$broadcast('connection.on');
        }

        function paused() {
            self.ignoreSocketDisconnect = true;
        }

        this.listenConnection = function () {
            document.addEventListener("online", setOnline, false);
            document.addEventListener("offline", setOffline, false);
            appSocket.on('connect', setOnline);
            appSocket.on('disconnect', function() {
                if (self.ignoreSocketDisconnect === true) {
                    self.ignoreSocketDisconnect = false;
                } else {
                    setOffline();
                }
            });
            if (ionic.Platform.isIOS()) {
                $rootScope.$on('app.pause', paused);
                $rootScope.$on('app.resume', forceOnline);
            }
        };

        this.getStatus = function () {
            return self.online;
        }
    }

    appStateListener.$inject = ['$rootScope'];
    function appStateListener($rootScope) {
        function resume() {
            $rootScope.isPaused = false;
            $rootScope.$broadcast('app.resume');
        }

        function pause() {
            $rootScope.isPaused = true;
            $rootScope.$broadcast('app.pause');
        }

        this.listenState = function () {
            document.addEventListener("resume", resume, false);
            document.addEventListener("pause", pause, false);
        }
    }

    ionicAnalyticsRun.$inject = ['$rootScope', '$ionicAnalytics', '$ionicPlatform'];
    function ionicAnalyticsRun($rootScope, $ionicAnalytics, $ionicPlatform) {
        $ionicPlatform.ready(function() {
            $ionicAnalytics.register();

            $rootScope.$on('user.login', function() {
                $ionicAnalytics.track('UserLoggedIn');
            });

            $rootScope.$on('connection.off', function() {
                $ionicAnalytics.track('ConnectionStateChange', {
                    action: 'off'
                });
            });

            $rootScope.$on('connection.on', function() {
                $ionicAnalytics.track('ConnectionStateChange', {
                    action: 'on'
                });
            });

            $rootScope.$on('geolocation.error', function (event, posError) {
                var errName = posError.code === PositionError.TIMEOUT ? 'timeout' : (posError.code === PositionError.POSITION_UNAVAILABLE ? 'unavailable' : 'permission');
                $ionicAnalytics.track('GeolocationError', {
                    action: errName
                });
            });

            $rootScope.$on('analytics.event', function(event, arg) {
                $ionicAnalytics.track(arg.category, {
                    action: arg.action,
                    label: arg.label,
                    value: arg.value
                });
            });
        });
    }

    googleAnalyticsRun.$inject = ['$cordovaGoogleAnalytics', '$ionicPlatform', 'appConfig', '$rootScope'];
    function googleAnalyticsRun($cordovaGoogleAnalytics, $ionicPlatform, appConfig, $rootScope) {
        $ionicPlatform.ready(function () {
            if (window.analytics) {
                $cordovaGoogleAnalytics.startTrackerWithId(appConfig.ga.trackingId);

                $rootScope.$on('user.login', function () {
                    $cordovaGoogleAnalytics.trackEvent('UserLoggedIn');
                });

                $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
                    $cordovaGoogleAnalytics.trackView(toState.name);
                });

                $rootScope.$on('user.login.checked', function (event, loginData) {
                    $cordovaGoogleAnalytics.setUserId(loginData.vkId);
                });

                $rootScope.$on('connection.off', function () {
                    $cordovaGoogleAnalytics.trackEvent('ConnectionStateChange', 'off');
                });

                $rootScope.$on('connection.on', function () {
                    $cordovaGoogleAnalytics.trackEvent('ConnectionStateChange', 'on');
                });

                $rootScope.$on('geolocation.error', function (event, posError) {
                    var errName = posError.code === PositionError.TIMEOUT ? 'timeout' : (posError.code === PositionError.POSITION_UNAVAILABLE ? 'unavailable' : 'permission');
                    $cordovaGoogleAnalytics.trackEvent('GeolocationError', errName);
                });

                $rootScope.$on('analytics.event', function (event, arg) {
                    $cordovaGoogleAnalytics.trackEvent(arg.category, arg.timing, arg.label, arg.value);
                });
            }
        });
    }

})(angular);