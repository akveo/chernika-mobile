/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.swiper')
        .factory('accountData', !isTesting ? accountData : accountDataFake)
        .controller('swiperController', swiperController)
        .controller('CardCtrl', CardCtrl);

    accountData.$inject = [];
    function accountData() {
        return {

        };
    }

    accountDataFake.$inject = ['$q'];
    function accountDataFake($q) {
        return {
            getPeopleSuggestions: function() {
                return $q.when();
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

    swiperController.$inject = ['$scope', 'peopleSuggestions', '$timeout', 'TDCardDelegate', 'suggestionsApi'];
    function swiperController($scope, peopleSuggestions, $timeout, TDCardDelegate, suggestionsApi) {

        var cardTypes = peopleSuggestions;

        $scope.cards = cardTypes.splice(0, 6);

        $scope.cardDestroyed = function(index) {
            $scope.cards.splice(index, 1);
        };

        $scope.addCard = function() {
            if (cardTypes.length) {
                $scope.cards.push(cardTypes[0]);
                cardTypes.splice(0, 1);
            }
        };

        $scope.dislikeFirst = function() {
            $scope.cards[0].programmaticalSwipe(true);
        };

        $scope.likeFirst = function() {
            $scope.cards[0].programmaticalSwipe(false);
        };
        $scope.cardSwipedLeft = function(index) {
            suggestionsApi.dislikeProfile($scope.cards[index].obj._id);
            $scope.addCard();
        };
        $scope.cardSwipedRight = function(index) {
            suggestionsApi.likeProfile($scope.cards[index].obj._id)
                .then(function(data) {
                    if (data.isMatched) {
                        alert('matched');
                    }
                });
            $scope.addCard();
        };
    }

    CardCtrl.$inject = ['$scope'];
    function CardCtrl($scope) {

    }

})(angular);