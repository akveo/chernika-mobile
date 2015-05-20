/**
 * Created by vl on 17.5.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.api')
        .factory('appSocket', appSocket)
        .run(apiRun);

    appSocket.$inject = ['socketFactory', 'appConfig'];
    function appSocket(socketFactory, appConfig) {
        var ioSocket = io.connect(appConfig.api.endpoint, {
            path: appConfig.api.socketPath
        });

        return socketFactory({
            ioSocket: ioSocket
        });
    }

    apiRun.$inject = ['appSocket'];
    function apiRun(appSocket) {
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