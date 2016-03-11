/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.auth')
        .controller('DeviceLoginController', DeviceLoginController)
        .factory('vkAuthenticator', vkAuthenticator)
        .service('vkApi', vkApi);

    DeviceLoginController.$inject = ['$scope', '$rootScope', '$state', 'vkApi', 'userApi', 'vkAuthenticator', '$ionicLoading', '$ionicPopup', 'appConfig'];
    function DeviceLoginController($scope, $rootScope, $state, vkApi, userApi, vkAuthenticator, $ionicLoading, $ionicPopup, appConfig) {
        $scope.isAndroid = ionic.Platform.isAndroid();

        $scope.$onVkSdkEvent('vkSdk.newToken', function(evt) {
            $ionicLoading.show();
            VkSdk.getUser(evt.detail.userId, function(r) {
                afterTokenReceive({
                    user_id: evt.detail.userId,
                    access_token: evt.detail.accessToken,
                    vkUser: getVkUserFromResponse(r)
                });
            })
        });

        $scope.$onVkSdkEvent('vkSdk.accessDenied', loginErr);

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
            return userApi
                .login(params)
                .then(function(data) {
                    $ionicLoading.hide();
                    if(data.data.confirmPolicy){
                        $rootScope.$broadcast('user.login');
                        $state.go('main.swiper');
                    } else {
                        showConfirmPolicyPopup();
                    }
                },loginErr);
        }

        function loginErr(e) {
            $ionicLoading.hide();
            $ionicPopup.alert(
                {
                    templateUrl: 'modules/auth/noResponsePopup.html',
                    cssClass: 'no-response-popup'
                }
            );
        }

        function showConfirmPolicyPopup(){
            $ionicPopup.confirm({
                templateUrl: 'modules/auth/terms.html',
                cssClass: 'terms-popup'
            }).then(function(confirm){
                if(confirm){
                    userApi.confirmPolicy();
                    $rootScope.$broadcast('user.login');
                    $state.go('main.swiper');
                } else {
                    localStorage.removeItem(appConfig.api.tokenLocalStorageKey);
                }
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

            var authURL = "https://oauth.vk.com/authorize?client_id=4851553&scope=photos,offline&redirect_uri=http://oauth.vk.com/blank.html&display=touch&response_type=token";
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

    function getVkUserFromResponse(r) {
        return !r.error && (r.response && r.response[0]) || (r && r[0])
    }

})(angular);