/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.matches', [])
        .config(swiperConfig);

    swiperConfig.$inject = ['$stateProvider'];
    function swiperConfig($stateProvider) {
        $stateProvider
            .state('main.matches', {
                url: '/matches',
                views: {
                    'tab-matches': {
                        templateUrl: 'modules/main/matches/matches.html',
                        controller: 'ChatsController'
                    }
                }
            })
            .state('main.match-detail', {
                url: '/matches/:chatId',
                params: {
                    name: 'Собеседник'
                },
                views: {
                    'tab-matches': {
                        templateUrl: 'modules/main/matches/chat.html',
                        controller: 'ChatDetailCtrl'
                    }
                }
            })
        ;
    }

})(angular);