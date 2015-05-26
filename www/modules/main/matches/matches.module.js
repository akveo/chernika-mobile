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
                params: {
                    name: 'Собеседник'
                },
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
            var chat = res[0];
            var messages = res[1];
            chat.name = $stateParams.name;
            return {
                chat: chat,
                messages: messages
            }
        });
    }
})(angular);