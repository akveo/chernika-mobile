/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    angular.module('app.main', ['app.main.matches', 'app.main.settings', 'app.main.swiper', 'app.main.common', 'app.api'])
        .config(appConfig);

    appConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
    function appConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            // setup an abstract state for the tabs directive
            .state('main', {
                url: "/main",
                abstract: true,
                controller: mainController,
                templateUrl: "modules/main/mainLayout.html",
                resolve: {
                    userProfile: userProfileResolve
                }
            })
    }

    userProfileResolve.$inject = ['userApi', '$ionicLoading', '$rootScope', '$ionicUser'];
    function userProfileResolve(userApi, $ionicLoading, $rootScope, $ionicUser) {
        $ionicLoading.show();

        function onCheckedLogin(loginData) {
            var ionicUser = $ionicUser.get();
            ionicUser.user_id = $ionicUser.generateGUID();

            angular.extend(ionicUser, {
                pinderId: loginData._id,
                vkId: loginData.vkId
            });

            return $ionicUser.identify(ionicUser)
                .then(function(){
                    $rootScope.identified = true;
                    $rootScope.ionicUser = ionicUser;
                    $ionicLoading.hide();
                    return loginData;
                });
        }
        
        return userApi.checkLoggedIn()
            .then(onCheckedLogin, onCheckedLogin);
    }

    mainController.$inject = ['$rootScope', 'userProfile'];
    function mainController($rootScope, userProfile) {
        $rootScope.userProfile = userProfile;
        $rootScope.platformId = window.cordova ? (window.cordova.platformId == 'android' ? 'android' : 'ios') : 'desktop'
    }

})(angular);