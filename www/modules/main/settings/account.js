/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.settings')
        .controller('AccountCtrl', AccountCtrl)
        .service('settingsTimeoutSaver', settingsTimeoutSaver)
        .filter('agePlus', agePlus);

    AccountCtrl.$inject = ['$scope', 'appConfig', 'settingsTimeoutSaver', 'currentSettings'];
    function AccountCtrl($scope, appConfig, settingsTimeoutSaver, currentSettings) {
        console.log(currentSettings);
        $scope.settings = angular.extend({
            enableDiscovery: true,
            distance: 100,
            minAge: 18,
            maxAge: 34,
            show: 2 //Female
        }, currentSettings);

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

