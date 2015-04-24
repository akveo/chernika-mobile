/**
 * Created by vl on 24.4.15.
 */
(function (angular) {
    'use strict';

    angular.module('app.api')
        .service('suggestionsApi', suggestionsApi);

    suggestionsApi.$inject = ['$http', 'appConfig', '$cordovaGeolocation'];
    function suggestionsApi($http, appConfig, $cordovaGeolocation) {

        var suggestionsEndpoint =  appConfig.api.endpoint + 'suggestions';

        this.getSuggestions = function(lat, lon) {
            return $http.get(suggestionsEndpoint, {
                params: {
                    lat: lat,
                    lon: lon
                }
            }).then(function(res) { return photoStubs; })
        };

    }

    var photoStubs = [
        {
            id: '1',
            name: 'Asa',
            age: 29,
            photo: 'img/fake/asa.jpg'
        },
        {
            id: '2',
            name: 'Leanna',
            age: 42,
            photo: 'img/fake/leanna.jpg'
        },
        {
            id: '5',
            name: 'Esperanza',
            age: 31,
            photo: 'img/fake/esperanza.jpg'
        },
        {
            id: '3',
            name: 'Gianna',
            age: 31,
            photo: 'img/fake/gianna.jpg'
        },
        {
            id: '4',
            name: 'Sasha',
            age: 27,
            photo: 'img/fake/sasha.jpg'
        }
    ];

})(angular);