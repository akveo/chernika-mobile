/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.swiper', ['angular-swipe-element', 'ionic.contrib.ui.tinderCards'])
        .config(swiperConfig);

    swiperConfig.$inject = ['$stateProvider'];
    function swiperConfig($stateProvider) {
        $stateProvider
            .state('main.swiper', {
                url: '/swiper',
                views: {
                    'tab-swiper': {
                        templateUrl: 'modules/main/swiper/swiper.html',
                        controller: 'swiperController',
                        controllerAs: 'vm',
                        resolve: {
                            peopleSuggestions: peopleSuggestionsResolve
                        }
                    }
                }
            })
            .state('main.profile-detail', {
                url: '/swiper/:profileId',
                views: {
                    'tab-swiper': {
                        templateUrl: 'modules/main/swiper/profileDetails.html',
                        controller: 'profileDetailsCtrl',
                        controllerAs: 'vm',
                        resolve: {
                            profileDetails: profileDetailsResolve
                        }
                    }
                }
            });
    }

    peopleSuggestionsResolve.$inject = ['suggestionsApi', '$cordovaGeolocation'];
    function peopleSuggestionsResolve(suggestionsApi, $cordovaGeolocation) {
        return $cordovaGeolocation
            .getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
            .then(function(position) {
                return suggestionsApi.getSuggestions(position.coords.latitude, position.coords.longitude);
            }, function() {
                // TODO: Error handling
            });
    }

    profileDetailsResolve.$inject = ['profilesApi', '$stateParams'];
    function profileDetailsResolve(profilesApi, $stateParams) {
        return profilesApi.getProfileData($stateParams.profileId);
    }
})(angular);