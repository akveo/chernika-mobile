/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.auth')
        .controller('DeviceLoginController', DeviceLoginController)
        .factory('vkAuthenticator', vkAuthenticator);

    DeviceLoginController.$inject = ['$scope', '$state', 'vkAuthenticator'];
    function DeviceLoginController($scope, $state, vkAuthenticator) {
        $scope.isAndroid = ionic.Platform.isAndroid();

        $scope.doAuthenticate = function() {
            vkAuthenticator()
                .then(function(authParams) {
                    //alert(JSON.stringify(authParams));
                    $state.go('main.swiper');
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

            return resDefer.promise;

            function onLoadStop(event) {
                var tmp = (event.url).split("#");
                if (tmp[0] == 'https://oauth.vk.com/blank.html' || tmp[0] == 'http://oauth.vk.com/blank.html') {
                    wwwref.close();
                    resDefer.resolve(appUtilities.queryToObject(tmp[1]));
                }
            }
        };
    }
})(angular);