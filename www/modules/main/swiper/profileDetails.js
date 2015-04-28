/**
 * Created by vl on 27.4.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.main.swiper')
        .controller('profileDetailsCtrl', profileDetailsCtrl);

    profileDetailsCtrl.$inject = ['$scope', 'profileDetails'];
    function profileDetailsCtrl($scope, profileDetails) {
        $scope.profileDetails = profileDetails;
        $scope.screenWidth = screen.width;
    }

})(angular);