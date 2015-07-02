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

    chatDetailsResolve.$inject = ['ChatsApi', 'profilesApi', '$stateParams', '$q', '$rootScope'];
    function chatDetailsResolve(ChatsApi, profilesApi, $stateParams, $q, $rootScope) {
        var chatPromise = ChatsApi.getChat($stateParams.chatId);
        var messagesPromise = ChatsApi.getMessages($stateParams.chatId);
        var userPromise = chatPromise
            .then(function (chat) {
                var chatUserId = chat.users[0] == $rootScope.userProfile._id ? chat.users[1] : chat.users[0];
                return profilesApi.getProfileInfo(chatUserId)
            })
            .then(function (profileInfo) {
                return profileInfo;
            });
        return $q.all([chatPromise, messagesPromise, userPromise]).then(function(res) {
            var chat = res[0];
            var messages = res[1];
            var user = res[2];
            chat.name = user.firstName;
            return {
                chat: chat,
                messages: messages,
                user: user
            }
        });
    }
})(angular);