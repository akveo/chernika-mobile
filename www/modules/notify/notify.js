(function(angular) {
  'use strict';

  angular.module('app.notify')
    .directive('tabBadgeHighlight', tabBadgeHighlight)
    .run(chatsNotifyEventsRun);

  chatsNotifyEventsRun.$inject = ['$rootScope', 'socketEventService', '$state'];
  function chatsNotifyEventsRun($rootScope, socketEventService, $state, $stateParams) {
    $rootScope.$on('user.login.checked', init);

    function init() {
      socketEventService.listen($rootScope, 'new_message', onNewMessage);
      //$rootScope.$on('connection.on', loadChats);
      //socketEventService.listen($rootScope, 'new_match', onNewMatch);
    }

    function loadChats() {

    }

    function onNewMessage(msg) {
      if (msg.sender != $rootScope.userProfile._id) {
        console.log('new msg')
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
