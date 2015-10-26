/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.auth')
      .directive('elementHeightLeft', elementHeightLeft)
      .directive('mockupVerticalAlign', mockupVerticalAlign);

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

    //Shitty shit, to tired to center the mockup properly
    function mockupVerticalAlign() {
        return {
            restrict: 'A',
            link: function(scope, $element) {
                var $slide = $element.parent('.slider-slide');
                var textBox = $slide[0].querySelector('.box');
                var textBoxHeight = textBox.offsetHeight + 20; //plus h4 margin for android
                var mockupHeight = $element[0].offsetHeight;
                var slideHeight = $slide[0].offsetHeight;
                $element[0].style.bottom = (slideHeight - mockupHeight)/2 - textBoxHeight + 'px';
            }
        };
    }
})(angular);