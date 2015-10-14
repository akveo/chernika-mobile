(function(angular) {

  angular.module('app.main.settings')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$state', '$scope', '$rootScope'];
  function SettingsController($state, $scope, $rootScope) {
    $scope.logout = function () {
      $rootScope.$broadcast('user.logout');
      $state.go('login');
    }
  }

})(angular);
