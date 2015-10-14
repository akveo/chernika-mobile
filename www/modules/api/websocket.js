/**
 * Created by vl on 17.5.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.api')
        .factory('appSocket', appSocket)
        .service('socketAuthorizer', socketAuthorizer)
        .service('socketEventService', socketEventService)
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

            $rootScope.$on('user.logout', function() {
                appSocket.emit('logout');
                appSocket.removeAllListeners();
            });

            appSocket.on('authorize', function () {
                var token = localStorage[appConfig.api.tokenLocalStorageKey];
                token && appSocket.emit('authorize', token);
            });
        }

        this.init = function() {
            onLogin();
        }

    }

    socketEventService.$inject = ['appSocket'];
    function socketEventService(appSocket) {
        this.listen = function($scope, eventName, cb) {
            appSocket.addListener(eventName, cb);
            $scope.$on('$destroy', function() {
                appSocket.removeListener(eventName, cb);
            });
        }
    }

    apiRun.$inject = ['appSocket', 'socketAuthorizer'];
    function apiRun(appSocket, socketAuthorizer) {
        socketAuthorizer.init();
    }

})(angular);