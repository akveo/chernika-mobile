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
        $scope.isLoading = true;
        $scope.hasConnection = true;

        profileDetails.getProfileDetails()
            .then(function (profileDetails) {
                $scope.profileDetails = profileDetails;
                $scope.isLoading = false;
            }, function () {
                $scope.hasConnection = false;
            })
    }

    profileDetails.$inject = ['profilesApi', '$stateParams'];
    function profileDetails(profilesApi, $stateParams) {
        this.getProfileDetails = function () {
            return profilesApi.getProfileData($stateParams.profileId);
        }
    }

})(angular);