(function(angular) {

  angular.module('app.main.settings')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$state', '$scope', '$ionicHistory'];
  function SettingsController($state, $scope, $ionicHistory) {
    $scope.logout = function() {
      localStorage.clear();
      $ionicHistory.clearCache();
      $state.go('login');
    }
  }

})(angular);
