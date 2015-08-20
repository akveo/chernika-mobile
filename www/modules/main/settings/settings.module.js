/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.settings', [])
        .config(swiperConfig);

    swiperConfig.$inject = ['$stateProvider'];
    function swiperConfig($stateProvider) {
        $stateProvider
            .state('main.settings', {
                url: '/settings',
                views: {
                    'tab-settings': {
                        templateUrl: 'modules/main/settings/settings.html',
                        controller: 'SettingsController'
                    }
                }
            })
            .state('main.settings-search', {
                url: '/settings/search',
                views: {
                    'tab-settings': {
                        templateUrl: 'modules/main/settings/searchSettings.html',
                        controller: 'AccountCtrl',
                        resolve: {
                            currentSettings: currentSettingsResolve
                        }
                    }
                }
            })
            .state('main.settings-photo', {
                url: '/settings/photo',
                views: {
                    'tab-settings': {
                        templateUrl: 'modules/main/settings/photoSettings.html',
                        controller: 'PhotoSettingsController',
                    }
                }
            });
    }

    currentSettingsResolve.$inject = ['userApi'];
    function currentSettingsResolve(userApi) {
        return userApi.getSettings();
    }

})(angular);