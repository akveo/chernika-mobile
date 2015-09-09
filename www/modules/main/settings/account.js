/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.settings')
        .controller('AccountCtrl', AccountCtrl)
        .service('settingsTimeoutSaver', settingsTimeoutSaver)
        .filter('agePlus', agePlus);

    AccountCtrl.$inject = ['$scope', 'appConfig', 'settingsTimeoutSaver', 'onConnectionChangePropertyListener', 'onLoadingPropertyListener', 'userApi'];
    function AccountCtrl($scope, appConfig, settingsTimeoutSaver, onConnectionChangePropertyListener, onLoadingPropertyListener, userApi) {
        $scope.settings = {};

        onConnectionChangePropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onGoodConnection: true,
            onBadConnection: false
        });

        onLoadingPropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onSuccess: true,
            onStart: false
        });

        $scope.$on('connection.on', load);

        load();

        $scope.$watch('settings', function(newValue, oldValue) {
            if (!angular.equals(newValue, oldValue)) {
                settingsTimeoutSaver.saveSettings(newValue);
            }
        }, true);

        $scope.$watch('settings.minAge', function(newValue, oldValue) {
            if ($scope.settings.maxAge - newValue < appConfig.settings.agesMinDistance) {
                $scope.settings.minAge = $scope.settings.maxAge - appConfig.settings.agesMinDistance;
            }
        });

        $scope.$watch('settings.maxAge', function(newValue, oldValue) {
            if (newValue - $scope.settings.minAge < appConfig.settings.agesMinDistance) {
                $scope.settings.maxAge = appConfig.settings.agesMinDistance + parseInt($scope.settings.minAge);
            }
        });

        function load() {
            $scope.$broadcast('connection.loading.start', {api: 'userApi', method: 'getSettings'});
            userApi.getSettings()
              .then(function (settings) {
                  $scope.settings = angular.extend({
                      enableDiscovery: true,
                      distance: 100,
                      minAge: 18,
                      maxAge: 34,
                      show: 2 //Female
                  }, settings);
                  $scope.$broadcast('connection.loading.success', {api: 'userApi', method: 'getSettings'});
              }, function (error) {
                  $scope.$broadcast('connection.loading.error', {api: 'userApi', method: 'getSettings', error: error});
              });
        }
    }

    settingsTimeoutSaver.$inject = ['$timeout', 'userApi', '$rootScope'];
    function settingsTimeoutSaver($timeout, userApi, $rootScope) {
        var lastChangeTooRecent = 0;
        this.saveSettings = function(settingsObject) {
            var settingsCopy = angular.copy(settingsObject);
            lastChangeTooRecent++;
            $timeout(function() {
                if (!--lastChangeTooRecent) {
                    userApi.saveSettings(settingsCopy)
                        .then(function() {
                            $rootScope.$broadcast('settings.changed');
                        });
                }
            }, 500);
        };
    }

    function agePlus() {
        return function(input) {
            return input == 55 ? '55+' : input;
        };
    }

})(angular);

