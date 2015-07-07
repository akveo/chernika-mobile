/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.matches')
        .service('ChatsApi', ChatsApi)
        .controller('ChatsController', ChatsController)
        .controller('ChatDetailCtrl', ChatDetailCtrl);

    ChatsController.$inject = ['$scope', 'chats', 'socketEventService'];
    function ChatsController($scope, chats, socketEventService) {
        $scope.chats = chats;
        $scope.remove = function() {

        };
        $scope.isChatHighlighted = function(chat) {
            if (chat.message) {
                var msg = chat.message;
                return !msg.wasRead && msg.sender != $scope.userProfile._id;
            }
        };

        socketEventService.listen($scope, 'new_message', function (msg) {
            chats.forEach(function (chat) {
                if(chat.chat == msg.chat) {
                    chat.message = msg;
                }
            });
        });

        socketEventService.listen($scope, 'message_read', function (msg) {
            chats.forEach(function (chat) {
                if(chat.chat == msg.chat && $scope.isChatHighlighted(chat)) {
                    chat.message = msg;
                }
            });
        })
    }

    ChatDetailCtrl.$inject = ['$scope', '$ionicScrollDelegate', '$timeout', 'chatDetails', 'ChatsApi', 'socketEventService'];
    function ChatDetailCtrl($scope, $ionicScrollDelegate, $timeout, chatDetails, ChatsApi, socketEventService) {
        $scope.chat = chatDetails.chat;
        $scope.messages = chatDetails.messages;
        $scope.user = chatDetails.user;
        $scope.motivationalMsg = motivationalMsgs[Math.floor(Math.random()*motivationalMsgs.length)]
        readMessages();

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

        $scope.tracker = function (msg) {
            return msg._id + msg.created;
        };

        $scope.isMsgYours = function (msg) {
            return msg.sender == $scope.userProfile._id;
        };

        $scope.$on('$ionicView.beforeEnter', function(){
            $ionicScrollDelegate.scrollBottom();
        });

        socketEventService.listen($scope, 'new_message', function(msg) {
            $scope.messages.every(function(scopeMsg, index) {
                if (msg.created == scopeMsg.created) {
                    $scope.messages[index] = msg;
                    return false;
                }
                return true;
            }) && addMessage(msg);
        });

        $scope.sendMessage = function() {
            var newMessage = {
                chat: $scope.chat._id,
                sender: $scope.userProfile._id,
                text: $scope.activeMessage,
                created: new Date().toISOString()
            };

            ChatsApi.sendMessage(newMessage);

            newMessage.isSending = true;
            $scope.messages.push(newMessage);

            delete $scope.activeMessage;

            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(true);
            });
        };

        function readMessages() {
            $scope.messages.forEach(function (msg) {
                !msg.wasRead && msg.sender != $scope.userProfile._id && ChatsApi.readMessage(msg);
            });
        }

        function addMessage(msg) {
            $scope.messages.push(msg);
            ChatsApi.readMessage(msg);
        }
    }

    ChatsApi.$inject = ['appSocket', '$http', 'appConfig'];
    function ChatsApi(appSocket, $http, appConfig) {
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
            appSocket.emit('new_message', message);
        };

        this.readMessage = function(message) {
            appSocket.emit('message_read', message);
        }
    }

    var motivationalMsgs = [
        'Пообщайтесь с Вашей парой',
        'Сделайте первый шаг!',
        'Напишите Вашей паре',
        'Cкажите что-нибудь смешное!',
        'Напишите комплимент и посмотрите, что получится',
        'Почему бы не сказать "привет"?',
        'Напишите что-нибудь забавное ниже',
        'Будьте вежливы... не молчите!',
        'Не бойтесь!'
    ]
})(angular);