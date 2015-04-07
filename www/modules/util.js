/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.util', [])
        .service('appUtilities', appUtilities);

    function appUtilities() {
        this.queryToObject = function(query) {
            return query.split('&').reduce(function(acc, part) {
                var splittedParts = part.split('=');
                acc[splittedParts[0]] = splittedParts[1];
                return acc;
            }, {});
        };
    }
})(angular);