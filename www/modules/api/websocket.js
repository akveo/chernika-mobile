/**
 * Created by vl on 17.5.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.api')
        .factory('appSocket', appSocket)
        .service('socketAuthorizer', socketAuthorizer)
        .run(apiRun);

    appSocket.$inject = ['socketFactory', 'appConfig'];
    function appSocket(socketFactory, appConfig) {
        var ioSocket = io.connect(appConfig.api.baseUrl, {
            path: appConfig.api.socketPath
        });

        return socketFactory({
            ioSocket: ioSocket
        });
    }

    socketAuthorizer.$inject = ['$rootScope', 'appSocket', 'appConfig'];
    function socketAuthorizer($rootScope, appSocket, appConfig) {
        function onLogin() {
            $rootScope.$on('user.login', function() {
                appSocket.emit('authorize', localStorage[appConfig.api.tokenLocalStorageKey]);
            });
        }

        this.init = function() {
            onLogin();
        }

    }

    apiRun.$inject = ['appSocket', 'socketAuthorizer'];
    function apiRun(appSocket, socketAuthorizer) {
        socketAuthorizer.init();
//        this.watchddd = function($scope, evewntName, cb) {
//            appSocket.on(eventName, cb);
//            $scope.$on('$destroy', function() {
//                appSocket.off(eventName, cb);
//            });
//        };
    }

//    function socketEventService() {
//        this.listen = function () {
//
//        }
//    }

})(angular);