/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.common')
        .controller('noConnectionCtrl', noConnectionCtrl)
        .controller('cleverLoaderCtrl', cleverLoaderCtrl)
        .directive('cleverLoader', cleverLoader)
        .directive('noConnection', noConnection);

    function noConnection() {
        return {
            restrict: 'E',
            templateUrl: 'modules/main/common/noConnection.html',
            scope: {
                showNoConnectionBanner: '='
            },
            controller: noConnectionCtrl
        }
    }

    noConnectionCtrl.$inject = ['$scope'];
    function noConnectionCtrl($scope) {

        $scope.$on('connection.off', function () {
            $scope.showNoConnectionBanner = true;
        });

        $scope.$on('connection.on', function () {
            $scope.showNoConnectionBanner = false;
        });

        $scope.$on('connection.error', function() {
            $scope.showNoConnectionBanner = true;
        });

        $scope.$on('connection.loading.success', function() {
            $scope.showNoConnectionBanner = false;
        })

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

    cleverLoaderCtrl.$inject = ['$scope','$rootScope'];
    function cleverLoaderCtrl($scope, $rootScope) {
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
            $scope.$watch('showNoConnectionBanner', function(oldValue, newValue) {
                $scope.isLoading = !newValue;
                updateIsSeen();
            })
        }

        function updateIsSeen() {
            $scope.isSeen = $scope.withNoConnectionBanner ? $scope.isLoading || $scope.showNoConnectionBanner : $scope.isLoading;
        }
    }


})(angular);
