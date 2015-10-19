(function(angular) {
  'use strict';

  angular.module('app.notify')
    .directive('tabBadgeHighlight', tabBadgeHighlight)
    .run(chatsNotifyEventsRun);

  chatsNotifyEventsRun.$inject = ['$rootScope', 'socketEventService', '$state'];
  function chatsNotifyEventsRun($rootScope, socketEventService, $state) {
    var unreadChats = [];
    $rootScope.$on('user.login.checked', init);

    function init() {
      unreadChats = [];
      socketEventService.listen($rootScope, 'new_message', onNewMessage);
      //$rootScope.$on('connection.on', loadChats);
      //socketEventService.listen($rootScope, 'new_match', onNewMatch);
    }

    function onNewMessage(msg) {
      if (isMessageNotificationNeeded(msg)) {
        addUnreadChat(msg);
        $rootScope.$broadcast('notify.message', msg);
      }
    }

    function isMessageNotificationNeeded(msg) {
      return msg.sender != $rootScope.userProfile._id
        && $state.current.name != 'main.match-detail'
        && $state.params.chatId != msg.chat;
    }

    function addUnreadChat(msg) {
      unreadChats.indexOf(msg.chat) == -1 && unreadChats.push(msg.chat);
    }
  }

  tabBadgeHighlight.$inject = ['$state'];
  function tabBadgeHighlight($state) {
    return {
      restrict: 'E',
      scope: true,
      link: function (scope, el, attrs) {
        scope.chatBadgeStyle = 'badge-notify';

        scope.$on('notify.message', onMessageNotify);

        function onMessageNotify(evt, msg) {
            setBadge(true);
        }

        function onChatsSelect() {
          setBadge(false);
        }

        function setBadge(isSet) {
          scope.chatBadge = isSet ? '1' : undefined;
        }
      }
    }
  }

})(angular);
