/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.auth')
        .directive('elementHeightLeft', elementHeightLeft);

    elementHeightLeft.$inject = ['$window', '$document'];
    function elementHeightLeft($window, $document) {
        return {
            restrict: 'A',
            priority: -10000,
            scope: {
                elementHeightLeft: '&'
            },
            link: function(scope, element) {
                var totalHeight = parseInt($window.getComputedStyle(element[0])['height']);
                var leftDivsHeight = [].slice.call($document[0].querySelectorAll('[include-in-height-computation]')).reduce(function(res, includedElement) {
                    return res + parseInt($window.getComputedStyle(includedElement)['height']);
                }, 0);
                scope.elementHeightLeft = totalHeight - leftDivsHeight;
            }
        };
    }
})(angular);