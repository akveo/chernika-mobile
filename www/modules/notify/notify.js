(function(angular) {
  'use strict';

  angular.module('app.notify')
    .directive('tabBadgeHighlight', tabBadgeHighlight)
    .run(chatsNotifyEventsRun);

  chatsNotifyEventsRun.$inject = ['$rootScope', 'socketEventService', '$state'];
  function chatsNotifyEventsRun($rootScope, socketEventService, $state) {
    var unreadChats = [];

    $rootScope.$on('user.login.checked', init);
    $rootScope.$watch(function () { return unreadChats.length; }, onUnreadChatLengthChange);

    function init() {
      unreadChats = [];
      socketEventService.listen($rootScope, 'new_message', onNewMessage);
      $rootScope.$on('chat.read', onChatRead);
      //$rootScope.$on('connection.on', loadChats);
    }

    function onNewMessage(msg) {
      if (isMessageNotificationNeeded(msg)) {
        addUnreadChat(msg.chat);
        $rootScope.$broadcast('notify.message', msg);
      }
    }

    function onChatRead(evt, chat) {
      deleteUnreadChat(chat._id);
    }

    function addUnreadChat(chatId) {
      unreadChats.indexOf(chatId) == -1 && unreadChats.push(chatId);
    }

    function deleteUnreadChat(chatId) {
      var chatIndex = unreadChats.indexOf(chatId);
      chatIndex != -1 && unreadChats.splice(chatIndex, 1);
    }

    function onUnreadChatLengthChange() {
      $rootScope.$broadcast('notify.unreadChatsLengthChange', unreadChats.length);
    }

    function isMessageNotificationNeeded(msg) {
      return msg.sender != $rootScope.userProfile._id
        && $state.current.name != 'main.match-detail'
        && $state.params.chatId != msg.chat;
    }
  }

  tabBadgeHighlight.$inject = ['$state'];
  function tabBadgeHighlight($state) {
    return {
      restrict: 'E',
      scope: true,
      link: function (scope, el, attrs) {

        scope.$on('notify.unreadChatsLengthChange', onUnreadChatsLengthChange);

        function onUnreadChatsLengthChange(evt, unreadChatsLength) {
            setBadge(unreadChatsLength);
        }

        function setBadge(badgeInfo) {
          scope.chatBadge = badgeInfo ? badgeInfo : undefined;
        }
      }
    }
  }

})(angular);
