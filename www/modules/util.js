/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.util', [])
        .service('appUtilities', appUtilities)
        .directive('croppedImage', croppedImage)
        .directive('containerWidth', containerWidth)
        .service('blurredModal', blurredModal)
        .directive('bgIcon', bgIcon)
        .directive('refocus', refocus)
        .service('appBack', appBack);

    function appUtilities() {
        this.queryToObject = function(query) {
            return query.split('&').reduce(function(acc, part) {
                var splittedParts = part.split('=');
                acc[splittedParts[0]] = splittedParts[1];
                return acc;
            }, {});
        };
    }

    croppedImage.$inject = ['appConfig'];
    function croppedImage(appConfig) {
        return {
            restrict: 'A',
            template: '<img ng-src="{{imageObject.src}}" ng-style="imageStyles"/>',
            scope: {
                imageObject: '=croppedImage',
                targetWidth: '='
            },
            link: function(scope, element) {
                var cropFactor = appConfig.cropFactor.width / appConfig.cropFactor.height;

                if (scope.targetWidth) {
                    applyStyles();
                }

                scope.$watch('targetWidth', applyStyles);
                scope.$watch('imageObject', applyStyles, true);

                function applyStyles() {
                    element.css({
                        width: scope.targetWidth + 'px',
                        height: (scope.targetWidth / cropFactor) + 'px',
                        overflow: 'hidden',
                        position: 'relative'
                    });

                    var imageScaleFactor = scope.targetWidth / scope.imageObject.crop.width;

                    scope.imageStyles = {
                        width: scope.imageObject.width * imageScaleFactor + 'px',
                        height: scope.imageObject.height * imageScaleFactor + 'px',
                        position: 'absolute',
                        top: (-scope.imageObject.crop.y * imageScaleFactor) + 'px',
                        left: (-scope.imageObject.crop.x * imageScaleFactor) + 'px'
                    };
                }

            }
        };
    }

    blurredModal.$inject = ['$ionicModal', '$rootScope'];
    function blurredModal($ionicModal, $rootScope) {

        function bindScopeLifecycleEvents(childScope, modal) {
            childScope.$parent.$on('$destroy', function() {
                modal.remove();
            });
            childScope.$on('modal.shown', function() {
                $rootScope.$contentBlurred = true;
            });
            childScope.$on('modal.hidden', function() {
                $rootScope.$contentBlurred = false;
            });
            childScope.$closeModal = function() {
                $rootScope.$contentBlurred = false;
                modal.remove();
            };
        }

        this.fromTemplateUrl = function(templateUrl, options) {
            return $ionicModal.fromTemplateUrl(templateUrl, options)
                .then(function(modal) {
                    bindScopeLifecycleEvents(options.scope, modal);
                    return modal;
                });
        };
    }

    refocus.$inject = ['$timeout'];
    function refocus($timeout) {
        return {
            restrict: "A",
            link: function(scope, element, attrs) {
                var elClicked = false;
                var id = attrs.refocus;
                var refocusableEl = angular.element(document.getElementById(id));

                element.on('touchstart', function () {
                    elClicked = true;
                });

                refocusableEl.on('blur', function (evt) {
                    if (elClicked) {
                        elClicked = false;
                        refocusableEl[0].focus()
                    }
                });
            }
        }
    }

    function bgIcon() {
        return {
            restrict: 'A',
            scope: {
                width: '=bgWidth'
            },
            link: function (scope, element) {
                scope.$watch('width', applyStyles);

                function applyStyles() {
                    element.css({
                        'width': scope.width + 'px',
                        'height': scope.width + 'px',
                        'line-height': scope.width + 'px',
                        'font-size': (scope.width * 0.5) + 'px'
                    })
                }
            }
        }
    }

    containerWidth.$inject = ['$window', '$timeout'];
    function containerWidth($window, $timeout) {
        return {
            restrict: 'A',
            scope: {
                containerWidth: '=',
                containerHeight: '='
            },
            priority: -8000,
            link: {
                post: function($scope, $element) {
                    $timeout(function() {
                        var computedStyle = $window.getComputedStyle($element[0]);
                        $scope.containerWidth = parseInt(computedStyle.getPropertyValue('width'));
                        $scope.containerHeight = parseInt(computedStyle.getPropertyValue('height'));
                    });
                }
            }
        };
    }

    appBack.$inject = ['$state', '$ionicPlatform'];
    function appBack($state, $ionicPlatform) {
        var mainState = null;
        var toMainStates = [];
        var toHomeStates = [];

        $ionicPlatform.registerBackButtonAction(back, 101);

        function back() {
            if (toHomeStates.indexOf($state.current.name) != -1) {
                navigator.home.home();
            } else if (toMainStates.indexOf($state.current.name) != -1) {
                $state.go(mainState);
            } else {
                navigator.app.backHistory();
            }
        }

        this.init = function(opts) {
            mainState = opts.mainState || mainState;
            toMainStates = opts.toMainStates || toHomeStates;
            toHomeStates = opts.toHomeStates || toHomeStates;
        }
    }

})(angular);