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

    ChatDetailCtrl.$inject = ['$scope', '$ionicScrollDelegate', '$timeout', 'chatDetails'];
    function ChatDetailCtrl($scope, $ionicScrollDelegate, $timeout, chatDetails) {
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
            return $http.get(messagesEndpoint).then(function(res) { console.log(res.data); return res.data; });
        };

        this.sendMessage = function (message) {
        };


    }
})(angular);