/**
 * Created by vl on 27.4.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.main.swiper')
        .service('profileDetails', profileDetails)
        .controller('profileDetailsCtrl', profileDetailsCtrl);

    profileDetailsCtrl.$inject = ['$scope', 'profileDetails', 'onConnectionChangePropertyListener', 'onLoadingPropertyListener'];
    function profileDetailsCtrl($scope, profileDetails, onConnectionChangePropertyListener, onLoadingPropertyListener) {
        $scope.screenWidth = screen.width;
        $scope.isContentSeen = false;

        onConnectionChangePropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onGoodConnection: true,
            onBadConnection: false
        });

        onLoadingPropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onSuccess: true,
            onStart: false
        });

        $scope.$on('connection.on', load);

        load();

        function load() {
            $scope.$broadcast('connection.loading.start', {api: 'profilesApi', method: 'getProfileData'});
            profileDetails.getProfileDetails()
                .then(function (profileDetails) {
                    $scope.profileDetails = profileDetails;
                    $scope.$broadcast('connection.loading.success', {api: 'profilesApi', method: 'getProfileData'});
                }, function (error) {
                    $scope.$broadcast('connection.loading.error', {api: 'profilesApi', method: 'getProfileData', error: error});
                });
        }
    }

    profileDetails.$inject = ['profilesApi', '$stateParams'];
    function profileDetails(profilesApi, $stateParams) {
        this.getProfileDetails = function () {
            return profilesApi.getProfileData($stateParams.profileId);
        }
    }

})(angular);