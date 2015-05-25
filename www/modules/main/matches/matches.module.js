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
                        controller: 'ChatsController',
                        resolve: {
                            chats: chatsInfoResolve
                        }
                    }
                }
            })
            .state('main.match-detail', {
                url: '/matches/:chatId',
                views: {
                    'tab-matches': {
                        templateUrl: 'modules/main/matches/chat.html',
                        controller: 'ChatDetailCtrl',
                        resolve: {
                            chatDetails: chatDetailsResolve
                        }
                    }
                }
            })
        ;
    }

    chatsInfoResolve.$inject = ['ChatsApi'];
    function chatsInfoResolve(ChatsApi) {
        return ChatsApi.getChatsInfo();
    }

    chatDetailsResolve.$inject = ['ChatsApi', '$stateParams', '$q'];
    function chatDetailsResolve(ChatsApi, $stateParams, $q) {
        var chatPromise = ChatsApi.getChat($stateParams.chatId);
        var messagesPromise = ChatsApi.getMessages($stateParams.chatId);
        return $q.all([chatPromise, messagesPromise]).then(function(res) {
            return {
                chat: res[0],
                message: res[1]
            }
        });
    }
})(angular);