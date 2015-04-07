/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.auth')
        .controller('DeviceLoginController', DeviceLoginController);

    DeviceLoginController.$inject = ['$scope'];
    function DeviceLoginController($scope) {
        $scope.isAndroid = ionic.Platform.isAndroid();
    }
})(angular);