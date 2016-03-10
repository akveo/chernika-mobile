/**
 * Created by vl on 27.4.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.main.swiper')
        .service('profileDetails', profileDetails)
        .controller('profileDetailsCtrl', profileDetailsCtrl);

    profileDetailsCtrl.$inject = ['$scope', 'profileDetails', 'onConnectionChangePropertyListener', 'onLoadingPropertyListener', '$ionicPopover', '$state', $stateParams, 'suggestionsApi'];
    function profileDetailsCtrl($scope, profileDetails, onConnectionChangePropertyListener, onLoadingPropertyListener, $ionicPopover, $state, $stateParams, suggestionsApi) {
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

        $ionicPopover.fromTemplateUrl('modules/main/swiper/profileDetailsPopover.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
        });

        function load() {
            $scope.$broadcast('connection.loading.start', {api: 'profilesApi', method: 'getProfileData'});
            profileDetails.getProfileDetails()
                .then(function (profileDetails) {
                    $scope.profileDetails = profileDetails;
                    $scope.distance = getDistance($scope.userProfile.lastKnownPosition.coordinates, profileDetails.lastKnownPosition.coordinates);
                    $scope.$broadcast('connection.loading.success', {api: 'profilesApi', method: 'getProfileData'});
                }, function (error) {
                    $scope.$broadcast('connection.loading.error', {api: 'profilesApi', method: 'getProfileData', error: error});
                });
        }

        $scope.openPopover = function($event) {
            $scope.popover.show($event);
        };

        $scope.complain = function() {
            window.plugins.toast.showWithOptions(
              {
                  message: "жалоба отправлена",
                  duration: "short",
                  position: "top"
              });
            $scope.popover.hide();
            suggestionsApi.dislikeProfile($stateParams.profileId);
            suggestionsApi.reportAbuse($stateParams.profileId);
            $state.go('main.swiper', {reloadCards: true})
        }
    }

    profileDetails.$inject = ['profilesApi', '$stateParams'];
    function profileDetails(profilesApi, $stateParams) {
        this.getProfileDetails = function () {
            return profilesApi.getProfileData($stateParams.profileId);
        }
    }

    function getDistance(coords1, coords2) {
        return geolib.getDistance(
          {latitude: coords1[1], longitude: coords1[0]},
          {latitude: coords2[1], longitude: coords2[0]},
          100
        ) / 1000;
    }

})(angular);