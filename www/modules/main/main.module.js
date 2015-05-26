/**
 * Created by vl on 31.3.15.
 */
(function(angular) {
    'use strict';

    angular.module('app.main', ['app.main.matches', 'app.main.settings', 'app.main.swiper', 'app.api'])
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

    userProfileResolve.$inject = ['userApi'];
    function userProfileResolve(userApi) {
        return userApi.checkLoggedIn();
    }

    mainController.$inject = ['$scope', 'userProfile'];
    function mainController($scope, userProfile) {
        $scope.userProfile = userProfile;
    }

})(angular);