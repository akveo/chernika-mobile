/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.auth')
        .controller('DeviceLoginController', DeviceLoginController)
        .service('vkApi', vkApi);

    DeviceLoginController.$inject = ['$scope', '$rootScope', '$state', 'vkApi', 'userApi'];
    function DeviceLoginController($scope, $rootScope, $state, vkApi, userApi) {
        $scope.isAndroid = ionic.Platform.isAndroid();

        $scope.$onVkSdkEvent('vkSdk.newToken', function(evt) {
            userApi
                .login({
                    user_id: evt.detail.userId,
                    access_token: evt.detail.accessToken
                })
                .then(function() {
                    $rootScope.$broadcast('user.login');
                    $state.go('main.swiper');
                }, function error(e) {
                    // TODO: User friendly error
                    alert('Service temporary unavailable. Please try again later');
                });
        });

        $scope.doAuthenticate = function() {
            vkApi.initiateLogin(['photos']);
        };
    }

    vkApi.$inject = ['$rootScope', '$ionicPlatform'];
    function vkApi($rootScope, $ionicPlatform) {
        $ionicPlatform.ready(function() {
            var VkSdk = window.VkSdk;
            VkSdk.init('4851553');
        });

        this.initiateLogin = function(permissions) {
            return VkSdk.initiateLogin(permissions);
        };

        $rootScope.$onVkSdkEvent = function(eventName, callback) {
            document.addEventListener(eventName, callback);
            this.$on('$destroy', function() {
                document.removeEventListener(eventName, callback);
            });
        };
    }

})(angular);