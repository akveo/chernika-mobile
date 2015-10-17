(function(angular) {
  'use strict';

  angular.module('app.notify')
    .directive('tabBadgeHighlight', tabBadgeHighlight)
    .run(chatsNotifyEventsRun);

  chatsNotifyEventsRun.$inject = ['$rootScope', 'socketEventService', '$state'];
  function chatsNotifyEventsRun($rootScope, socketEventService, $state, $stateParams) {
    init();

    function init() {
      $rootScope.$on('connection.on', loadChats);
      socketEventService.listen($rootScope, 'new_message', onNewMessage);
      //socketEventService.listen($rootScope, 'new_match', onNewMatch);
    }

    function loadChats() {

    }

    function onNewMessage(msg) {
      if (msg.sender != $rootScope.userProfile._id) {
        $rootScope.$broadcast('notify.message', msg)
      }
    }
  }

  tabBadgeHighlight.$inject = ['$state'];
  function tabBadgeHighlight($state) {
    return {
      restrict: 'E',
      scope: true,
      link: function (scope, el, attrs) {
        scope.chatBadgeStyle = 'badge-notify';
        scope.onChatsSelect = onChatsSelect;

        scope.$on('notify.message', onMessageNotify);

        function onMessageNotify(evt, msg) {
          if ($state.current.name.indexOf('match') == -1) {
            setBadge(true);
          }
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
