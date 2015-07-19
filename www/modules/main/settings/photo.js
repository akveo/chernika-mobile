(function(angular) {

    angular.module('app.main.settings')
        .service('photoSettingsWidthCalculator', photoSettingsWidthCalculator)
        .service('cropModal', cropModal)
        .directive('draggablePhoto', draggablePhoto)
        .directive('photoCrop', photoCrop)
        .controller('PhotoSettingsController', PhotoSettingsController);

    PhotoSettingsController.$inject = ['$scope', 'userPhotos', 'photoSettingsWidthCalculator', 'cropModal'];
    function PhotoSettingsController($scope, userPhotos, photoSettingsWidthCalculator, cropModal) {
        $scope.photos = userPhotos;
        $scope.selectedPhoto = $scope.photos[0];
        $scope.currentCrop = {};
        $scope.photosWidth = photoSettingsWidthCalculator.calculate();

        cropModal.getModal($scope)
            .then(function(modal) {
               $scope.cropModal = modal;
            });

        $scope.closeCrop = function () {
            $scope.cropModal.hide();
        };

        $scope.saveCrop = function () {
            $scope.selectedPhoto.crop = {
                x: $scope.currentCrop.x,
                y: $scope.currentCrop.y,
                height: $scope.currentCrop.height,
                width: $scope.currentCrop.width
            };
            $scope.cropModal.hide();
        };

        $scope.onDropComplete = function(dropIndex, data){
            var draggedIndex = $scope.photos.indexOf(data);
            if (dropIndex == 0 || draggedIndex == 0) {
                $scope.photos[draggedIndex] = $scope.photos[dropIndex];
                $scope.photos[dropIndex] = data;
            }
        };

        $scope.$on('draggable.selected', function (evt, photo) {
            evt.stopPropagation();
            $scope.selectedPhoto = photo;
            $scope.cropModal.show();
        })
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
                scope.photo = scope.photos[scope.index];

                var dragEl = angular.element(element[0].querySelector('[ng-drag]'));
                var bgIconContainer = angular.element(element[0].querySelector('.bg-icon-container'));

                scope.$watch('width', applyStyles);

                scope.onRelease = function () {
                    dragEl.hasClass('dragging') || scope.$emit('draggable.selected', scope.photo);
                };

                function applyStyles() {
                    bgIconContainer.css({
                        'width': scope.width + 'px',
                        'height': scope.height + 'px',
                        'line-height': scope.width + 'px',
                        'font-size': (scope.width * 0.5) + 'px',
                    });
                }
            }
        }
    }

    function photoCrop() {
        return {
            restrict: 'A',
            scope: true,
            templateUrl: 'modules/main/settings/photoCrop.html',
            link: function (scope, element, attrs) {
                var canvas = element.find('canvas');
                scope.areaMinWidth = screen.width / 1.5;

                scope.$watch('selectedPhoto', applyStyles);

                scope.onCropChange = function(crop) {
                    var scale = scope.selectedPhoto.height / canvas[0].height;
                    scope.currentCrop.height = crop.size * scale;
                    scope.currentCrop.width = crop.size * scale;
                    scope.currentCrop.x = crop.x * scale;
                    scope.currentCrop.y = crop.y * scale;
                };

                function applyStyles() {
                    var width = screen.width;
                    var scale = width / scope.selectedPhoto.width;
                    var height = scope.selectedPhoto.height * scale;
                    element.css({
                        width: width + 'px',
                        height: height + 'px',
                        overflow: 'hidden',
                        position: 'relative'
                    });
                }
            }
        }
    }

    cropModal.$inject = ['$ionicModal'];
    function cropModal($ionicModal) {
        this.getModal = function(scope) {
            return $ionicModal.fromTemplateUrl('modules/main/settings/cropModal.html', {scope: scope})
                .then(function(modal) {
                    scope.$on('destroy', modal.remove);
                    return modal;
                })
        };

    }


})(angular);
