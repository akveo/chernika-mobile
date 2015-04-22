/**
 * Created by vl on 22.4.15.
 */
(function (angular, localStorage) {
    'use strict';

    angular.module('app.auth')
        .config(authCookieConfig);

    persistentAuthCookie.$inject = ['appConfig'];
    function persistentAuthCookie(appConfig) {
        return {
            // optional method
            'request': function(config) {
                if (config.url.indexOf(appConfig.api.endpoint) === 0) {
                    var persistentSession = localStorage.getItem('pinderSession');
                    if (persistentSession) {
                        config.headers['Pinder-Session'] = persistentSession;
                    }
                }

                // do something on success
                return config;
            },

            // optional method
            'response': function(response) {
                // do something on success
                if (response.config.url.indexOf(appConfig.api.endpoint) === 0) {
                    var newSessionValue = response.headers('Pinder-Session');
                    if (newSessionValue) {
                        localStorage.setItem('pinderSession', newSessionValue);
                    } else {
                        localStorage.removeItem('pinderSession');
                    }

                }

                return response;
            }

        };
    }

    authCookieConfig.$inject = ['$httpProvider'];
    function authCookieConfig($httpProvider) {
        $httpProvider.interceptors.push(persistentAuthCookie);
    }

})(angular, localStorage);