(function (angular) {
    'use strict';

    angular.module('app.api')
        .service('ChatsApi', ChatsApi);


    ChatsApi.$inject = ['appSocket', '$http', 'appConfig'];
    function ChatsApi(appSocket, $http, appConfig) {
        var chatsEndpoint = appConfig.api.endpoint + 'chats';

        this.getChats = function () {
            return $http.get(chatsEndpoint).then(function(res) { return res.data; });
        };

        this.getChatsInfo = function() {
            return $http.get(chatsEndpoint + '/info').then(function(res) { return res.data; });
        };

        this.getChat = function (chatId) {
            var chatEndpoint = chatsEndpoint + '/' + chatId;
            return $http.get(chatEndpoint).then(function(res) { return res.data; });
        };

        this.getMatchedProfileChat = function (matchedProfileId) {
            var matchedChatEndpoint = chatsEndpoint + '/matched/' + matchedProfileId;
            return $http.get(matchedChatEndpoint).then(function(res) { return res.data; });
        };

        this.getMessages = function(chatId, skip) {
            var messagesEndpoint = chatsEndpoint + '/' + chatId + '/messages';
            return $http.get(messagesEndpoint, {params:{"skip": skip}})
              .then(function(res) { return res.data && res.data.reverse(); });
        };

        this.sendMessage = function (message) {
            appSocket.emit('new_message', message);
        };

        this.readMessage = function(message) {
            appSocket.emit('message_read', message);
        };

        this.joinChat = function(chatId) {
            appSocket.emit('join_chat', chatId);
        }
    }

})(angular);