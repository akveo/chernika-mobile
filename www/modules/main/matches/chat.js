/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.matches')
        .service('ChatsApi', ChatsApi)
        .controller('ChatsController', ChatsController)
        .controller('ChatDetailCtrl', ChatDetailCtrl);

    ChatsController.$inject = ['$scope', 'chats'];
    function ChatsController($scope, chats) {
        $scope.chats = chats;
        $scope.remove = function() {

        }
    }

    ChatDetailCtrl.$inject = ['$scope', '$ionicScrollDelegate', '$timeout', 'chatDetails', 'ChatsApi', 'socketEventService'];
    function ChatDetailCtrl($scope, $ionicScrollDelegate, $timeout, chatDetails, ChatsApi, socketEventService) {
        $scope.chat = chatDetails.chat;
        $scope.messages = chatDetails.messages;

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
            }) && $scope.messages.push(msg);
        });

        $scope.sendMessage = function() {
            var newMessage = {
                chat: $scope.chat._id,
                sender: $scope.userProfile._id,
                text: $scope.activeMessage,
                created: new Date().getTime()
            };

            ChatsApi.sendMessage(newMessage);

            newMessage.isSending = true;
            $scope.messages.push(newMessage);

            delete $scope.activeMessage;

            $timeout(function() {
                $ionicScrollDelegate.scrollBottom(true);
            });
        };
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
            return $http.get(messagesEndpoint).then(function(res) { console.log(res.data); return res.data; });
        };

        this.sendMessage = function (message) {
            appSocket.emit('new_message', message);
        };
    }
})(angular);