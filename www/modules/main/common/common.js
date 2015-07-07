/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.common')
        .service('noConnectionModal', noConnectionModal)
        .controller('noConnectionCtrl', noConnectionCtrl)
        .directive('noConnection', noConnection)
        .directive('loading', loading);

    noConnectionModal.$inject = ['$rootScope', '$ionicModal'];
    function noConnectionModal($rootScope, $ionicModal) {
        var that = this;

        $ionicModal.fromTemplateUrl('modules/main/common/noConnection.html', {
            animation: 'slide-in-up'
        }).then(function(modal) {
            that.modal = modal;
        });

        this.activate = function() {
            $rootScope.$on('connection.off', function () {
                that.modal.show();
            });
            $rootScope.$on('connection.on', function () {
                that.modal.hide();
            });
        }

    }

    function loading() {
        return {
            restrict: 'E',
            templateUrl: 'modules/main/common/loading.html',
            scope: {
                isLoading: '=isLoading'
            }
        };
    }

    function noConnection() {
        return {
            restrict: 'E',
            templateUrl: 'modules/main/common/noConnection.html',
            scope: {
                hasConnection: '=hasConnection'
            },
            controller: noConnectionCtrl
        }
    }

    noConnectionCtrl.$inject = ['$rootScope', '$scope'];
    function noConnectionCtrl($rootScope, $scope) {

        $rootScope.$on('connection.off', function () {
            debugger;
            $scope.hasConnection = false;
        });

        $rootScope.$on('connection.on', function () {
            $scope.hasConnection = true;
        });

    }


})(angular);
