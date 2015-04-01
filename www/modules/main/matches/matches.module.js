/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.matches', [])
        .config(swiperConfig);

    swiperConfig.$inject = ['$stateProvider'];
    function swiperConfig($stateProvider) {
        $stateProvider.state('main.matches', {
            url: '/matches',
            views: {
                'tab-matches': {
                    templateUrl: 'modules/main/matches/matches.html',
                    controller: 'ChatsController'
                }
            }
        });
    }
})(angular);