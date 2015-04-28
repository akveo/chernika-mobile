/**
 * Created by vl on 7.4.15.
 */
(function(angular) {
    angular.module('app.util', [])
        .service('appUtilities', appUtilities)
        .directive('croppedImage', croppedImage);

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
})(angular);