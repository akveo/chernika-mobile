/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.swiper', ['angular-swipe-element'])
        .config(swiperConfig);

    swiperConfig.$inject = ['$stateProvider'];
    function swiperConfig($stateProvider) {
        $stateProvider.state('main.swiper', {
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
        });
    }

    peopleSuggestionsResolve.$inject = ['accountData'];
    function peopleSuggestionsResolve(accountData) {
        return accountData.getPeopleSuggestions();
    }
})(angular);