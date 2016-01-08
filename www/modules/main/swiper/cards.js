/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.swiper')
        .service('suggestionsByLocation',suggestionsByLocation)
        .controller('swiperController', swiperController);

    suggestionsByLocation.$inject = ['suggestionsApi', 'multiplatformGeolocation', '$rootScope', 'appConfig', '$q', 'appUtilities'];
    function suggestionsByLocation(suggestionsApi, multiplatformGeolocation, $rootScope, appConfig, $q, appUtilities) {
        this.getSuggestionsByLocation = function() {
            var geolocationPromise = null;
            if ($rootScope.userProfile._id != appConfig.testUser.id) {
                geolocationPromise = multiplatformGeolocation.getCurrentPosition();
            } else {
                // Predefined coordinates for test user
                geolocationPromise = $q.when(appUtilities.clone({ coords: appConfig.testUser.testCoordinates }));
            }
            return geolocationPromise
                .then(function(position) {
                    updateUserProfileCoords(position.coords);
                    return suggestionsApi.getSuggestions(position.coords.latitude, position.coords.longitude);
                }, function(err) {
                    throw err;
                });
        };

        function updateUserProfileCoords(coordinates) {
            $rootScope.userProfile.lastKnownPosition.coordinates = [coordinates.longitude, coordinates.latitude];
        }
    }

    swiperController.$inject = ['$scope', '$rootScope', 'suggestionsApi', 'suggestionsByLocation', 'userProfile', 'blurredModal', 'appConfig', 'ChatsApi', 'socialShare'];
    function swiperController($scope, $rootScope, suggestionsApi, suggestionsByLocation, userProfile, blurredModal, appConfig, ChatsApi, socialShare) {

        $scope.geoEnabled = true;
        $scope.cards = [];
        $scope.loading = true;
        var viewSizing = $scope.viewSizing = {};

        $scope.$on('settings.changed', load);

        $scope.$on('app.resume', reloadEmptyCards);
        $scope.$watch('cards.length', reloadEmptyCards);

        $scope.cardDestroyed = function(index) {
            $scope.cards.splice(index, 1);
        };

        $scope.dislikeFirst = function() {
            $scope.$broadcast('tinderCards.swipeProgrammatically', true);
        };

        $scope.likeFirst = function() {
            $scope.$broadcast('tinderCards.swipeProgrammatically', false);
        };
        $scope.cardSwipedLeft = function(index) {
            suggestionsApi.dislikeProfile($scope.cards[index].obj._id);
            swipeToAnalytics(false, $scope.cards[index].obj);
        };
        $scope.cardSwipedRight = function(index) {
            var matchingProfile = $scope.cards[index].obj;
            suggestionsApi.likeProfile(matchingProfile._id)
              .then(function(data) {
                  if (data.isMatched) {
                      var newScope = $scope.$new();
                      newScope.matchingProfile = matchingProfile;
                      var modal;
                      blurredModal.fromTemplateUrl('modules/main/swiper/newMatch.html', {
                          scope: newScope,
                          animation: 'slide-in-up'
                      })
                        .then(function(m) {
                            modal = m;
                            return ChatsApi.getMatchedProfileChat(matchingProfile._id);
                        })
                        .then(function (chat) {
                            newScope.chatId = chat._id;
                            modal.show();
                        });
                  }
              });
            swipeToAnalytics(true, $scope.cards[index].obj);
        };

        $scope.switchToLocationSettings = function () {
            var diagnostic = window.cordova.plugins.diagnostic;
            $scope.platformId == 'android' && diagnostic.switchToLocationSettings();
        };

        $scope.share = socialShare.share;

        function swipeToAnalytics(isLike, cardObj) {
            $scope.$emit('analytics.event', {
                category: 'LikeDislikeProfile',
                action: isLike ? 'like': 'dislike',
                label: 'targetAge',
                value: cardObj.age
            });
        }

        function reloadEmptyCards() {
            $scope.cards.length || load();
        }

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

        function load() {
            if (!$scope.isLoading) {
                $scope.loading = true;
                $scope.geoEnabled = true;
                $scope.cards = [];
                var loadStart = new Date();
                suggestionsByLocation.getSuggestionsByLocation()
                  .then(function(suggestions) {
                      var loadEnd = new Date();
                      suggestionTimeToAnalytics(loadEnd - loadStart);
                      $scope.cards = suggestions;
                      $scope.loading = false;
                  }, function(err) {
                      $scope.loading = false;
                      suggestionTimeToAnalytics();
                      //Cordova geolocation error contains error code
                      //so, to recognize position errors we do it by checking
                      //code field's value. Clumsy, :(
                      if (err.code) {
                          $scope.geoEnabled = false;
                          $rootScope.$broadcast('geolocation.error', err)
                      }
                  });
            }
        }

        function suggestionTimeToAnalytics(msTimeDiff) {
            $scope.$emit('analytics.event', {
                category: 'Suggestion',
                action: 'timing',
                label: 'time',
                timing: msTimeDiff ? msTimeDiff/1000 : Infinity
            });
        }

    }

})(angular);