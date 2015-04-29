/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.util', [])
        .service('appUtilities', appUtilities)
        .directive('croppedImage', croppedImage)
        .service('blurredModal', blurredModal)
        .filter('ageFromVkDate', ageFromVkDate);

    function appUtilities() {
        this.queryToObject = function(query) {
            return query.split('&').reduce(function(acc, part) {
                var splittedParts = part.split('=');
                acc[splittedParts[0]] = splittedParts[1];
                return acc;
            }, {});
        };
        this.parseVkDate = function(dateStr) {
            var splittedDate = dateStr.split('.');
            return new Date(splittedDate[2], splittedDate[1] - 1, splittedDate[0]);
        };
        this.getCurrentAge = function(birthDate) {
            var today = new Date();
            return today.getYear() - birthDate.getYear() -
                ((today.getMonth() > birthDate.getMonth() || (today.getMonth() == birthDate.getMonth() && today.getDate() >= birthDate.getDate())) ? 0 : 1);
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
        };
    }

    ageFromVkDate.$inject = ['appUtilities'];
    function ageFromVkDate(appUtilities) {
        return function(input) {
            var birthDate = input && appUtilities.parseVkDate(input);
            return birthDate && appUtilities.getCurrentAge(birthDate);

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
})(angular);