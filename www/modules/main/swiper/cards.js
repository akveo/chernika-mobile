/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.swiper')
        .service('suggestionsByLocation',suggestionsByLocation)
        .controller('swiperController', swiperController);

    suggestionsByLocation.$inject = ['suggestionsApi', '$cordovaGeolocation'];
    function suggestionsByLocation(suggestionsApi, $cordovaGeolocation) {
        this.getSuggestionsByLocation = function() {
            return $cordovaGeolocation
                .getCurrentPosition({timeout: 10000, enableHighAccuracy: false})
                .then(function(position) {
                    return suggestionsApi.getSuggestions(position.coords.latitude, position.coords.longitude);
                });
        };
    }

    swiperController.$inject = ['$scope', 'suggestionsApi', 'suggestionsByLocation', 'userProfile', 'blurredModal', '$cordovaDialogs'];
    function swiperController($scope, suggestionsApi, suggestionsByLocation, userProfile, blurredModal, $cordovaDialogs) {

        $scope.userProfile = userProfile;
        $scope.cards = [];

        suggestionsByLocation.getSuggestionsByLocation()
            .then(function(suggestions) {
                $scope.cards = suggestions;
            }, function() {
                $cordovaDialogs.alert('Невозможно определить текущую геолокацию.', 'Ошибка')
            });

        $scope.cardDestroyed = function(index) {
            $scope.cards.splice(index, 1);
        };

        $scope.dislikeFirst = function() {
            $scope.cards[0].programmaticalSwipe(true);
        };

        $scope.likeFirst = function() {
            $scope.cards[0].programmaticalSwipe(false);
        };
        $scope.cardSwipedLeft = function(index) {
            suggestionsApi.dislikeProfile($scope.cards[index].obj._id);
        };
        $scope.cardSwipedRight = function(index) {
            var matchingProfile = $scope.cards[index].obj;
            suggestionsApi.likeProfile(matchingProfile._id)
                .then(function(data) {
                    if (data.isMatched) {
                        alert('matched');
                    }
                }, function() {
                    var newScope = $scope.$new();
                    newScope.matchingProfile = matchingProfile;
                    blurredModal.fromTemplateUrl('modules/main/swiper/newMatch.html', {
                        scope: newScope,
                        animation: 'slide-in-up'
                    }).then(function(modal) {
                        modal.show();
                    });
                });
        };
    }

})(angular);