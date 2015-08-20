(function(angular) {

  angular.module('app.main.settings')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$state', '$scope'];
  function SettingsController($state, $scope) {
    $scope.logout = function() {
      localStorage.clear();
      $state.go('login');
    }
  }

})(angular);
