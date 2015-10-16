(function(angular) {

  angular.module('app.main.settings')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$state', '$scope', '$rootScope', 'socialShare'];
  function SettingsController($state, $scope, $rootScope, socialShare) {
    $scope.logout = function () {
      $rootScope.$broadcast('user.logout');
      $state.go('login');
    };

    $scope.share = socialShare.share;
  }

})(angular);
