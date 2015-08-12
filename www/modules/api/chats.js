(function (angular) {
    'use strict';

    angular.module('app.api')
        .service('ChatsApi', ChatsApi);


    ChatsApi.$inject = ['appSocket', '$http', 'appConfig'];
    function ChatsApi(appSocket, $http, appConfig) {
        var chatsEndpoint = appConfig.api.endpoint + 'chats';
        var self = this;

        this.getChatsInfo = function() {
            return $http.get(chatsEndpoint).then(function(res) { return res.data; });
        };

        this.getChat = function (chatId) {
            var chatEndpoint = chatsEndpoint + '/' + chatId;
            return $http.get(chatEndpoint).then(function(res) { return res.data; });
        };

        this.getMatchedProfileChat = function (matchedProfileId) {   //TODO: Change API to make method simpler and faster
            return self.getChatsInfo()
              .then(function (chats) {
                  var foundChat;
                  chats.forEach(function (c) {
                      foundChat = c.user._id == matchedProfileId ? c : foundChat;
                  });
                  return foundChat;
              })
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
        };

        this.joinChat = function(chatId) {
            appSocket.emit('join_chat', chatId);
        }
    }

})(angular);