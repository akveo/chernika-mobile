/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.auth')
        .controller('DeviceLoginController', DeviceLoginController)
        .factory('vkAuthenticator', vkAuthenticator)
        .service('vkApi', vkApi);

    DeviceLoginController.$inject = ['$scope', '$rootScope', '$state', 'vkApi', 'userApi', 'vkAuthenticator', '$ionicLoading'];
    function DeviceLoginController($scope, $rootScope, $state, vkApi, userApi, vkAuthenticator, $ionicLoading) {
        $scope.isAndroid = ionic.Platform.isAndroid();

        $scope.$onVkSdkEvent('vkSdk.newToken', function(evt) {
            VkSdk.getUser(evt.detail.userId, function(r) {
                var vkUser = !r.error && r.response && r.response.length > 0 ? r.response[0] : {};
                afterTokenReceive({
                    user_id: evt.detail.userId,
                    access_token: evt.detail.accessToken,
                    vkUser: vkUser
                });
            })
        });

        $scope.doAuthenticate = function() {
            $scope.$emit('analytics.event', {category: 'LoginButtonClicked'});
            if (window.cordova) {
                vkApi.initiateLogin(['photos', 'offline']);
            } else {
                vkAuthenticator()
                    .then(function(authParams) {
                        return afterTokenReceive(authParams);
                    })
            }
        };

        function afterTokenReceive(params) {
            $ionicLoading.show();
            return userApi
                .login(params)
                .then(function() {
                    $rootScope.$broadcast('user.login');
                    $ionicLoading.hide();
                    $state.go('main.swiper');
                }, function error(e) {
                    // TODO: User friendly error
                    $ionicLoading.hide();
                    alert('Service temporary unavailable. Please try again later');
                });
        }
    }

    vkApi.$inject = ['$rootScope', '$ionicPlatform'];
    function vkApi($rootScope, $ionicPlatform) {
        $ionicPlatform.ready(function() {
            if (window.cordova) {
                var VkSdk = window.VkSdk;
                VkSdk.init('4851553');
            }
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