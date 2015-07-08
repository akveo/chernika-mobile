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
                }, function(err) {
                    throw err;
                });
        };
    }

    swiperController.$inject = ['$scope', 'suggestionsApi', 'suggestionsByLocation', 'userProfile', 'blurredModal', '$cordovaDialogs', 'appConfig'];
    function swiperController($scope, suggestionsApi, suggestionsByLocation, userProfile, blurredModal, $cordovaDialogs, appConfig) {

        $scope.userProfile = userProfile;
        $scope.geoEnabled = true;
        $scope.cards = [];
        var viewSizing = $scope.viewSizing = {};

        suggestionsByLocation.getSuggestionsByLocation()
            .then(function(suggestions) {
                $scope.cards = suggestions;
            }, function(err) {
                if (err.code == 1 ) { //PERMISSION_DENIED
                    $scope.geoEnabled = false;
                }
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
                        var newScope = $scope.$new();
                        newScope.matchingProfile = matchingProfile;
                        blurredModal.fromTemplateUrl('modules/main/swiper/newMatch.html', {
                            scope: newScope,
                            animation: 'slide-in-up'
                        }).then(function(modal) {
                            modal.show();
                        });
                    }
                });
        };

        function recalculateSizing() {
            if (!viewSizing.swiperViewWidth || !viewSizing.swiperViewHeight)
                return;

            if (viewSizing.swiperViewWidth + appConfig.swiper.cardFooterHeight + appConfig.swiper.cardVerticalOffset <= viewSizing.swiperViewHeight) {
                $scope.cardStyles = {
                    width: viewSizing.swiperViewWidth + 'px',
                    height: (viewSizing.swiperViewWidth + appConfig.swiper.cardFooterHeight) + 'px',
                    'margin-left': -viewSizing.swiperViewWidth / 2 + 'px',
                    'margin-top': -(viewSizing.swiperViewWidth + appConfig.swiper.cardFooterHeight) / 2 + 'px'
                };
            } else {
                $scope.cardStyles = {
                    height: viewSizing.swiperViewHeight + 'px',
                    width: (viewSizing.swiperViewHeight - appConfig.swiper.cardFooterHeight) + 'px',
                    'margin-top': -viewSizing.swiperViewHeight / 2 + 'px',
                    'margin-left': -(viewSizing.swiperViewHeight - appConfig.swiper.cardFooterHeight) / 2 + 'px'
                };
            }

            $scope.imageActualWidth = parseInt($scope.cardStyles.width);
        }

        $scope.$watch('viewSizing', function(oldValue, newValue) {
            recalculateSizing();
        }, true);

    }

})(angular);