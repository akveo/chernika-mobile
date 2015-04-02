/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.swiper')
        .factory('accountData', !isTesting ? accountData : accountDataFake)
        .controller('swiperController', swiperController);

    accountData.$inject = [];
    function accountData() {
        return {

        };
    }

    accountDataFake.$inject = ['$q'];
    function accountDataFake($q) {
        return {
            getPeopleSuggestions: function() {
                return $q.when([
                    {
                        name: 'Asa',
                        age: 29,
                        photo: 'img/fake/asa.jpg'
                    },
                    {
                        name: 'Leanna',
                        age: 42,
                        photo: 'img/fake/leanna.jpg'
                    },
                    {
                        name: 'Esperanza',
                        age: 31,
                        photo: 'img/fake/esperanza.jpg'
                    },
                    {
                        name: 'Gianna',
                        age: 31,
                        photo: 'img/fake/gianna.jpg'
                    },
                    {
                        name: 'Sasha',
                        age: 27,
                        photo: 'img/fake/sasha.jpg'
                    }
                ]);
            }
        };
    }

    var OFFSET_TO_SWIPE_ACCEPT = 100;

    function calculateOpacity(deltaX, factor) {
        var opacity = deltaX / (2 * OFFSET_TO_SWIPE_ACCEPT) * factor;
        if (opacity < 0) {
            return 0;
        } else if (opacity > 1) {
            return 1;
        } else {
            return opacity;
        }
    }

    swiperController.$inject = ['$scope', 'peopleSuggestions', '$timeout'];
    function swiperController($scope, peopleSuggestions, $timeout) {
        var vm = this;

        $scope.hello = 'world';
        $scope.useTransition = true;

        $scope.suggestions = peopleSuggestions;

        $scope.suggestionMoved = function(sugg, deltaX, deltaY) {
            sugg.translateStyle = 'translate3d(' + deltaX + 'px,' + deltaY + 'px, 0)';
            $scope.useTransition = false;
            sugg.yesOpacity = calculateOpacity(deltaX, 1);
            sugg.noOpacity = calculateOpacity(deltaX, -1);
        };


        $scope.suggestionMoveEnd = function(sugg, deltaX, hDir) {
            $scope.useTransition = true;
            $timeout(function() {
                if (Math.abs(deltaX) > OFFSET_TO_SWIPE_ACCEPT) {
                    $scope.suggestions = $scope.suggestions.slice(1, $scope.suggestions.length);
                } else {
                    delete sugg.translateStyle;
                    delete sugg.yesOpacity;
                    delete sugg.noOpacity;
                }
            }, 20);

        };
    }

})(angular);