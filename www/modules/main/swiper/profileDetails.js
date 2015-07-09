/**
 * Created by vl on 27.4.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.main.swiper')
        .service('profileDetails', profileDetails)
        .controller('profileDetailsCtrl', profileDetailsCtrl);

    profileDetailsCtrl.$inject = ['$scope', 'profileDetails'];
    function profileDetailsCtrl($scope, profileDetails) {
        $scope.screenWidth = screen.width;
        $scope.isContentSeen = false;

        $scope.$broadcast('connection.loading.start');

        profileDetails.getProfileDetails()
            .then(function (profileDetails) {
                $scope.profileDetails = profileDetails;
                $scope.isContentSeen = true;
                $scope.$broadcast('connection.loading.success');
            }, function (error) {
                $scope.$broadcast('connection.error', error);
            });
    }

    profileDetails.$inject = ['profilesApi', '$stateParams'];
    function profileDetails(profilesApi, $stateParams) {
        this.getProfileDetails = function () {
            return profilesApi.getProfileData($stateParams.profileId);
        }
    }

})(angular);