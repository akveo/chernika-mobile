/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.common')
        .controller('cleverLoaderCtrl', cleverLoaderCtrl)
        .service('LoadingEventsToAnalytics', LoadingEventsToAnalytics)
        .service('onConnectionChangePropertyListener', onConnectionChangePropertyListener)
        .service('onLoadingPropertyListener', onLoadingPropertyListener)
        .service('PushInitializer', PushInitializer)
        .service('IonicUserInitializer', IonicUserInitializer)
        .service('multiplatformGeolocation', multiplatformGeolocation)
        .directive('cleverLoader', cleverLoader)
        .directive('onReturn', onReturn);

    multiplatformGeolocation.inject = ['$q'];
    function multiplatformGeolocation ($q) {
        var self = this;

        this.getCurrentPosition = function (opts) {
            var q = $q.defer();

            self.locationModule.getCurrentPosition(function (result) {
                q.resolve(result);
            }, function (err) {
                q.reject(err);
            }, opts || self.positionOptions);

            return q.promise;
        };

        this.init = function () {
            var PRIORITY_BALANCED_POWER_ACCURACY = 102;
            self.positionOptions = {
                timeout: 30000,
                enableHighAccuracy: false,
                priority: PRIORITY_BALANCED_POWER_ACCURACY
            };

            self.locationModule = window.cordova && window.cordova.platformId == 'android' ? LocationServices : navigator.geolocation;
        }
    }

    PushInitializer.$inject = ['$rootScope', '$ionicPush', 'userApi'];
    function PushInitializer($rootScope, $ionicPush, userApi) {
        this.init = function () {
            $rootScope.$on('user.ionic.identified', function () {
                return $ionicPush.register({
                    canShowAlert: true,
                    canSetBadge: true,
                    canPlaySound: true,
                    canRunActionsOnWake: true,
                    onNotification: function(notification) {
                        // Handle new push notifications here
                        console.log(notification);
                        return true;
                    }
                });
            });

            $rootScope.$on('$cordovaPush:tokenReceived', function(event, data) {
                userApi.addDevice(data);
                $rootScope.deviceToken = data.token;
            });
        }
    }

    IonicUserInitializer.$inject = ['$rootScope','$ionicUser'];
    function IonicUserInitializer($rootScope, $ionicUser) {
        this.init = function () {
            $rootScope.$on('user.login.checked', function (event, loginData) {
                var ionicUser = $ionicUser.get();

                ionicUser.user_id = loginData.vkId.toString();

                angular.extend(ionicUser, {
                    pinderId: loginData._id,
                    vkId: loginData.vkId,
                    sex: loginData.sex,
                    age: loginData.age
                });
                return $ionicUser.identify(ionicUser)
                    .then(function(){
                        $rootScope.ionicUser = ionicUser;
                        $rootScope.$broadcast('user.ionic.identified')
                    });
            });
        }
    }

    onReturn.$inject = ['$timeout'];
    function onReturn($timeout){
        return {
            restrict: 'A',
            scope: {
                'onReturn': '&'
            },
            link: function(scope, element, attr){
                element.bind('keydown', function(e){
                    if(e.which == 13){
                        $timeout(function(){
                            scope.onReturn();
                        });
                    }
                });
            }
        }
    }

    function LoadingEventsToAnalytics() {
        this.init = function (scope) {
            scope.$on('connection.loading.start', function (event, data) {
                scope.$emit('analytics.event', {
                    category: 'ConnectionLoading',
                    action: 'start'
                });
            });

            scope.$on('connection.loading.success', function (event, data) {
                scope.$emit('analytics.event', {
                    category: 'ConnectionLoading',
                    action: 'success'
                });
            });

            scope.$on('connection.loading.error', function (event, data) {
                scope.$emit('analytics.event', {
                    category: 'ConnectionLoading',
                    action: 'error'
                });
            });
        };
    }

    function cleverLoader() {
        return {
            restrict: 'E',
            templateUrl: 'modules/main/common/cleverLoader.html',
            scope: {
                withNoConnectionBanner: '@',
                isSeen: '='
            },
            controller: cleverLoaderCtrl
        }
    }

    cleverLoaderCtrl.$inject = ['$scope','onConnectionChangePropertyListener', 'onLoadingPropertyListener', 'LoadingEventsToAnalytics'];
    function cleverLoaderCtrl($scope, onConnectionChangePropertyListener, onLoadingPropertyListener, LoadingEventsToAnalytics) {
        $scope.showNoConnectionBanner = false;
        $scope.isLoading = $scope.isSeen;

        LoadingEventsToAnalytics.init($scope);

        onLoadingPropertyListener.listen($scope, {
            prop: 'isLoading',
            onSuccess: false,
            onStart: true,
            onError: false
        });

        $scope.$watch('isLoading', updateIsSeen);

        if ($scope.withNoConnectionBanner) {
            onConnectionChangePropertyListener.listen($scope, {
                prop: 'showNoConnectionBanner',
                onGoodConnection: false,
                onBadConnection: true
            });

            onLoadingPropertyListener.listen($scope, {
                prop: 'showNoConnectionBanner',
                onError: true,
                onSuccess: false
            });

            $scope.$watch('showNoConnectionBanner', function(newValue, oldValue) {
                $scope.isLoading = newValue === true ? false : $scope.isLoading;
                updateIsSeen();
            })
        }

        function updateIsSeen() {
            $scope.isSeen = $scope.withNoConnectionBanner ? $scope.isLoading || $scope.showNoConnectionBanner : $scope.isLoading;
        }
    }

    function onConnectionChangePropertyListener() {
        this.listen = function($scope, opts) {
            var prop = opts.prop;
            var onBadConnection = opts.onBadConnection;
            var onGoodConnection = opts.onGoodConnection;

            isProperty(onBadConnection) && $scope.$on('connection.off', function () {
                $scope[prop] = onBadConnection;
            });

            isProperty(onGoodConnection) && $scope.$on('connection.on', function () {
                $scope[prop] = onGoodConnection;
            });
        }
    }

    function onLoadingPropertyListener() {
        this.listen = function($scope, opts) {
            var prop = opts.prop;
            var onError = opts.onError;
            var onSuccess = opts.onSuccess;
            var onStart = opts.onStart;

            isProperty(onError) && $scope.$on('connection.loading.error', function() {
                $scope[prop] = onError;
            });

            isProperty(onSuccess) && $scope.$on('connection.loading.success', function() {
                $scope[prop] = onSuccess;
            });

            isProperty(onStart) && $scope.$on('connection.loading.start', function() {
                $scope[prop] = onStart;
            });
        };
    }

    function isProperty(prop) {
        return prop !== undefined;
    }
})(angular);
