/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.auth')
        .controller('DeviceLoginController', DeviceLoginController)
        .factory('vkAuthenticator', vkAuthenticator)
        .service('vkApi', vkApi);

    DeviceLoginController.$inject = ['$scope', '$rootScope', '$state', 'vkApi', 'userApi', 'vkAuthenticator'];
    function DeviceLoginController($scope, $rootScope, $state, vkApi, userApi, vkAuthenticator) {
        $scope.isAndroid = ionic.Platform.isAndroid();

        $scope.$onVkSdkEvent('vkSdk.newToken', function(evt) {
            afterTokenReceive({
                user_id: evt.detail.userId,
                access_token: evt.detail.accessToken
            });
        });

        $scope.doAuthenticate = function() {
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
            return userApi
                .login(params)
                .then(function() {
                    $rootScope.$broadcast('user.login');
                    $state.go('main.swiper');
                }, function error(e) {
                    // TODO: User friendly error
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

    vkAuthenticator.$inject = ['$q', '$window', 'appUtilities'];
    function vkAuthenticator($q, $window, appUtilities) {
        return function() {
            var resDefer = $q.defer();

            var authURL = "https://oauth.vk.com/authorize?client_id=4851553&scope=photos&redirect_uri=http://oauth.vk.com/blank.html&display=touch&response_type=token";
            var wwwref = $window.open(encodeURI(authURL), '_blank', 'location=no');
            wwwref.addEventListener('loadstop', onLoadStop);
            var callbackFunctionName = 'vkAuthenticatorCallback_' + new Date().getTime();
            var callbackFunction = $window[callbackFunctionName] = function(queryStr) {
                delete $window[callbackFunctionName];
                resDefer.resolve(appUtilities.queryToObject(queryStr));
            };

            return resDefer.promise;

            function onLoadStop(event) {
                var tmp = (event.url).split("#");
                if (tmp[0] == 'https://oauth.vk.com/blank.html' || tmp[0] == 'http://oauth.vk.com/blank.html') {
                    wwwref.close();
                    callbackFunction(tmp[1]);
                }
            }
        };
    }

})(angular);