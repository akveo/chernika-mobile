/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.common')
        .controller('cleverLoaderCtrl', cleverLoaderCtrl)
        .service('onConnectionChangePropertyListener', onConnectionChangePropertyListener)
        .directive('cleverLoader', cleverLoader);

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

    cleverLoaderCtrl.$inject = ['$scope','onConnectionChangePropertyListener'];
    function cleverLoaderCtrl($scope, onConnectionChangePropertyListener) {
        $scope.showNoConnectionBanner = false;
        $scope.isLoading = $scope.isSeen;

        $scope.$on('connection.loading.start', function () {
            $scope.isLoading = true;
            updateIsSeen();
        });

        $scope.$on('connection.loading.success', function () {
            $scope.isLoading = false;
            updateIsSeen();
        });

        if ($scope.withNoConnectionBanner) {
            onConnectionChangePropertyListener.listen($scope, {
                prop: 'showNoConnectionBanner',
                onGoodConnection: false,
                onBadConnection: true
            });

            $scope.$watch('showNoConnectionBanner', function(newValue, oldValue) {
                $scope.isLoading = !newValue;
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
            var handleConnectionErrors = opts.handleConnectionErrors !== false;

            $scope.$on('connection.off', function () {
                $scope[prop] = onBadConnection;
            });

            $scope.$on('connection.on', function () {
                $scope[prop] = onGoodConnection;
            });

            $scope.$on('connection.loading.success', function() {
                $scope[prop] = onGoodConnection;
            });

            if (handleConnectionErrors) {
                $scope.$on('connection.error', function() {
                    $scope[prop] = onBadConnection;
                });
            }
        }
    }

})(angular);
