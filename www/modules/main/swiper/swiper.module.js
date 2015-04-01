/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.swiper', [])
        .config(swiperConfig);

    swiperConfig.$inject = ['$stateProvider'];
    function swiperConfig($stateProvider) {
        $stateProvider.state('main.swiper', {
            url: '/swiper',
            views: {
                'tab-swiper': {
                    templateUrl: 'modules/main/swiper/swiper.html',
                    controller: function() {}
                }
            }
        });
    }
})(angular);