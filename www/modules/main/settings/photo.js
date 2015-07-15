(function(angular) {

    angular.module('app.main.settings')
        .service('photoSettingsWidthCalculator', photoSettingsWidthCalculator)
        .directive('draggablePhoto', draggablePhoto)
        .controller('PhotoSettingsController', PhotoSettingsController);

    PhotoSettingsController.$inject = ['$scope', 'userPhotos', 'photoSettingsWidthCalculator', '$rootScope'];
    function PhotoSettingsController($scope, userPhotos, photoSettingsWidthCalculator, $rootScope) {
        $scope.photos = userPhotos;
        $scope.photosWidth = photoSettingsWidthCalculator.calculate();

        $scope.onDropComplete=function(dropIndex, data){
            var draggedIndex = $scope.photos.indexOf(data);
            if (dropIndex == 0 || draggedIndex == 0) {
                $scope.photos[draggedIndex] = $scope.photos[dropIndex];
                $scope.photos[dropIndex] = data;
            }
        }
    }

    photoSettingsWidthCalculator.$inject = [];
    function photoSettingsWidthCalculator() {
        var screenWidth = screen.width;
        var containerPaddings = 10;
        var photoGutter = 15;

        this.calculate = function() {
            var contentWidth = screenWidth - containerPaddings*2;
            var smallPhotoWidth = (contentWidth - photoGutter*2)/3;
            var bigPhotoWidth = contentWidth - smallPhotoWidth - photoGutter;

            return {
                smallPhotoWidth: smallPhotoWidth,
                bigPhotoWidth: bigPhotoWidth
            }
        }
    }

    function draggablePhoto() {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: 'modules/main/settings/draggablePhoto.html',
            link: function (scope, element, attrs) {
                scope.index = parseInt(attrs.photoIndex);
                scope.width = attrs.photoWidth;

                var dragEl = angular.element(element[0].querySelector('[ng-drag]'));

                scope.onRelease = function () {
                    console.log(dragEl.hasClass('dragging'));
                };
            }
        }
    }


})(angular);
