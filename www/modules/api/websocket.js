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
        var ioSocket = io.connect({
            path: appConfig.api.endpoint + 'socket.io'
        });

        return socketFactory({
            ioSocket: ioSocket
        });
    }

    apiRun.$inject = ['appSocket'];
    function apiRun(appSocket) {
    }

})(angular);