/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.common')
        .controller('cleverLoaderCtrl', cleverLoaderCtrl)
        .service('onConnectionChangePropertyListener', onConnectionChangePropertyListener)
        .service('onLoadingPropertyListener', onLoadingPropertyListener)
        .service('multiplatformGeolocation', multiplatformGeolocation)
        .directive('cleverLoader', cleverLoader);

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

    cleverLoaderCtrl.$inject = ['$scope','onConnectionChangePropertyListener', 'onLoadingPropertyListener'];
    function cleverLoaderCtrl($scope, onConnectionChangePropertyListener, onLoadingPropertyListener) {
        $scope.showNoConnectionBanner = false;
        $scope.isLoading = $scope.isSeen;

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
