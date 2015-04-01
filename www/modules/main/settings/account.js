/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.settings')
        .controller('AccountCtrl', AccountCtrl);

    AccountCtrl.$inject = ['$scope'];
    function AccountCtrl($scope) {
        $scope.settings = {
            enableFriends: true
        };
    }

})(angular);

