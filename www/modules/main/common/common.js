/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.common')
        .controller('cleverLoaderCtrl', cleverLoaderCtrl)
        .service('noConnectionBannerListener', noConnectionBannerListener)
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

    cleverLoaderCtrl.$inject = ['$scope','noConnectionBannerListener'];
    function cleverLoaderCtrl($scope, noConnectionBannerListener) {
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
            noConnectionBannerListener.init($scope, 'showNoConnectionBanner');

            $scope.$watch('showNoConnectionBanner', function(newValue, oldValue) {
                $scope.isLoading = !newValue;
                updateIsSeen();
            })
        }

        function updateIsSeen() {
            $scope.isSeen = $scope.withNoConnectionBanner ? $scope.isLoading || $scope.showNoConnectionBanner : $scope.isLoading;
        }
    }

    function noConnectionBannerListener() {
        this.init = function($scope, showBannerProp) {
            $scope.$on('connection.off', function () {
                $scope[showBannerProp] = true;
            });

            $scope.$on('connection.on', function () {
                $scope[showBannerProp] = false;
            });

            $scope.$on('connection.error', function() {
                $scope[showBannerProp] = true;
            });

            $scope.$on('connection.loading.success', function() {
                $scope[showBannerProp] = false;
            })
        }
    }

})(angular);
