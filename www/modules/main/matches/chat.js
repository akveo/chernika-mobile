/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.matches')
        .factory('Chats', Chats)
        .service('ChatsApi', ChatsApi)
        .controller('ChatsController', ChatsController)
        .controller('ChatDetailCtrl', ChatDetailCtrl);

    function Chats() {
        var chats = [{
            id: 0,
            name: 'Ben Sparrow',
            lastText: 'You on your way?',
            face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
        }, {
            id: 1,
            name: 'Max Lynx',
            lastText: 'Hey, it\'s me',
            face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
        }, {
            id: 2,
            name: 'Andrew Jostlin',
            lastText: 'Did you get the ice cream?',
            face: 'https://pbs.twimg.com/profile_images/491274378181488640/Tti0fFVJ.jpeg'
        }, {
            id: 3,
            name: 'Adam Bradleyson',
            lastText: 'I should buy a boat',
            face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
        }, {
            id: 4,
            name: 'Perry Governor',
            lastText: 'Look at my mukluks!',
            face: 'https://pbs.twimg.com/profile_images/491995398135767040/ie2Z_V6e.jpeg'
        }];

        return {
            all: function() {
                return chats;
            },
            remove: function(chat) {
                chats.splice(chats.indexOf(chat), 1);
            },
            get: function(chatId) {
                for (var i = 0; i < chats.length; i++) {
                    if (chats[i].id === parseInt(chatId)) {
                        return chats[i];
                    }
                }
                return null;
            }
        };
    }

    ChatsController.$inject = ['$scope', 'Chats', 'chats'];
    function ChatsController($scope, Chats, chats) {
        $scope.chats = chats;
        $scope.remove = function(chat) {
            Chats.remove(chat);
        }
    }

    ChatDetailCtrl.$inject = ['$scope', 'Chats', '$stateParams', '$ionicScrollDelegate', '$timeout'];
    function ChatDetailCtrl($scope, Chats, $stateParams, $ionicScrollDelegate, $timeout) {
        $scope.chat = Chats.get($stateParams.matchId);
        $scope.messages = [
            {
                messageId: '1',
                isYour: true,
                content: 'Привет',
                date: 1429808558000
            },
            {
                messageId: '2',
                isYour: false,
                content: 'привет',
                date: 1429808603000
            },
            {
                messageId: '3',
                isYour: true,
                content: 'Хочешь я тебя пикапну?',
                date: 1429808611000
            },
            {
                messageId: '4',
                isYour: false,
                content: 'Давай',
                date: 1429808621000
            },
            {
                messageId: '5',
                isYour: false,
                content: 'пикапай',
                date: 1429808650000
            },
            {
                messageId: '6',
                isYour: true,
                content: 'Где встречаемся?',
                date: 1429808691000
            },
            {
                messageId: '7',
                isYour: false,
                content: 'На улке',
                date: 1429808811000
            },
            {
                messageId: '8',
                isYour: false,
                content: 'Захвати пивас',
                date: 1429811009000
            }
        ];

        window.addEventListener('native.keyboardshow', function() {
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom();
            }, 100);
        });

        window.addEventListener('native.keyboardhide', function() {
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom();
            }, 100);
        });

        $scope.$on('$ionicView.beforeEnter', function(){
            $ionicScrollDelegate.scrollBottom();
        });

        $scope.sendMessage = function() {
            var newMessage = {
                messageId: new Date().getTime(),
                isYour: true,
                content: $scope.activeMessage,
                date: new Date().getTime(),
                isSending: true
            };
            $scope.messages.push(newMessage);
            delete $scope.activeMessage;
            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(true);
            });
            $timeout(function() {
                delete newMessage.isSending;
            }, 1000);
        };
    }

    ChatsApi.$inject = ['appSocket', '$q', '$http', 'appConfig'];
    function ChatsApi(appSocket, $q, $http, appConfig) {
        var chatsEndpoint = appConfig.api.endpoint + 'chats';

        this.getChatsInfo = function() {
            return $http.get(chatsEndpoint).then(function(res) { return res.data; });
        };
        
        this.getChat = function (chatId) {
            var chatEndpoint = chatsEndpoint + '/' + chatId;
            return $http.get(chatEndpoint).then(function(res) { return res.data; });
        };

        this.getMessages = function(chatId) {
            var messagesEndpoint = chatsEndpoint + '/' + chatId + '/messages';
            return $http.get(messagesEndpoint).then(function(res) { return res.data; });
        };

        this.sendMessage = function (message) {
        };


    }
})(angular);