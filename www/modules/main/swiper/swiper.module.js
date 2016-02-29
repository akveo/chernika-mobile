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
                url: '/swiper?reloadCards',
                views: {
                    'tab-swiper': {
                        templateUrl: 'modules/main/swiper/swiper.html',
                        controller: 'swiperController',
                        controllerAs: 'vm'
                    }
                }
            })
            .state('main.profile-detail', {
                url: '/swiper/:profileId',
                views: {
                    'tab-swiper': {
                        templateUrl: 'modules/main/swiper/profileDetails.html',
                        controller: 'profileDetailsCtrl',
                        controllerAs: 'vm'
                    }
                }
            });
    }

})(angular);