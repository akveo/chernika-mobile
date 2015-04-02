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

    swiperController.$inject = ['$scope', 'peopleSuggestions', '$timeout'];
    function swiperController($scope, peopleSuggestions, $timeout) {
        var vm = this;

        $scope.hello = 'world';
        $scope.useTransition = true;

        $scope.suggestions = peopleSuggestions;

        $scope.suggestionSwipeStart = function() {
            $scope.useTransition = false;
        };

        $scope.suggestionMoved = function(sugg, deltaX, deltaY) {
            sugg.translateStyle = 'translate3d(' + deltaX + 'px,' + deltaY + 'px, 0)';
            sugg.zIndex = 10;
        };


        $scope.suggestionMoveEnd = function(sugg, deltaX, hDir) {
            if (Math.abs(deltaX) > 100) {
                $timeout(function() {
                    $scope.suggestions = $scope.suggestions.slice(0, $scope.suggestions.length - 1);
                }, 20);
                sugg.zIndex = -1;
                delete sugg.translateStyle;
            } else {
                $scope.useTransition = true;

                $timeout(function() {
                    delete sugg.translateStyle;
                });
            }
        };
    }

})(angular);