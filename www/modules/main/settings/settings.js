(function(angular) {

  angular.module('app.main.settings')
    .controller('SettingsController', SettingsController);

  SettingsController.$inject = ['$state', '$scope', '$rootScope', 'socialShare', 'userApi'];
  function SettingsController($state, $scope, $rootScope, socialShare, userApi) {
    $scope.logout = function () {
      userApi.logout($rootScope.deviceInfo);
      $rootScope.$broadcast('user.logout');
      $state.go('login');
    };

    $scope.share = socialShare.share;
  }

})(angular);
