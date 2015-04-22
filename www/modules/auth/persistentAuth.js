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
                    var persistentSession = localStorage.getItem(appConfig.api.tokenLocalStorageKey);
                    if (persistentSession) {
                        config.headers[appConfig.api.accessHeader] = persistentSession;
                    }
                }

                // do something on success
                return config;
            },

            // optional method
            'response': function(response) {
                // do something on success
                if (response.config.url.indexOf(appConfig.api.endpoint) === 0) {
                    var newSessionValue = response.headers(appConfig.api.accessHeader);
                    if (newSessionValue) {
                        localStorage.setItem(appConfig.api.tokenLocalStorageKey, newSessionValue);
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