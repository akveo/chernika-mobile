(function(angular) {

    angular.module('app.main.settings')
        .service('photoSettingsWidthCalculator', photoSettingsWidthCalculator)
        .service('cropModalGetter', cropModalGetter)
        .directive('draggablePhoto', draggablePhoto)
        .directive('cropModal', cropModal)
        .controller('PhotoSettingsController', PhotoSettingsController);

    PhotoSettingsController.$inject = ['$scope', '$rootScope', 'userPhotos', 'photoSettingsWidthCalculator', 'cropModalGetter', 'userApi'];
    function PhotoSettingsController($scope, $rootScope, userPhotos, photoSettingsWidthCalculator, cropModalGetter, userApi) {
        $scope.photos = userPhotos;
        $scope.selectedPhoto = $scope.photos[0];
        $scope.currentCrop = {};
        $scope.photosWidth = photoSettingsWidthCalculator.calculate();

        $scope.$on('draggable.selected', onDraggableSelected);
        $scope.$on('draggable.dropComplete', onDropComplete);

        cropModalGetter.getModal($scope)
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
            savePhotos();
            $scope.cropModal.hide();
        };

        function onDropComplete(evt, draggedPhoto, dropPhoto){
            evt.stopPropagation();
            var draggedIndex = $scope.photos.indexOf(draggedPhoto);
            var dropIndex = $scope.photos.indexOf(dropPhoto);
            if (dropIndex == 0 || draggedIndex == 0) {
                $scope.photos[draggedIndex] = dropPhoto;
                $scope.photos[dropIndex] = draggedPhoto;
                savePhotos();
            }
        }

        function onDraggableSelected(evt, photo) {
            evt.stopPropagation();
            $scope.selectedPhoto = photo;
            $scope.cropModal.show();
        }

        function savePhotos() {
            return userApi.savePhotos($scope.photos)
                .then(function () {
                    $rootScope.$broadcast('settings.photos.changed');
                })
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
            scope: {
                photo: '=',
                width: '=photoWidth'
            },
            templateUrl: 'modules/main/settings/draggablePhoto.html',
            link: function (scope, element) {
                var dragEl;
                var bgIconContainer = angular.element(element[0].querySelector('.bg-icon-container'));

                scope.$watch('width', applyStyles);
                scope.$watch('photo', attachHandlers);

                function applyStyles() {
                    bgIconContainer.css({
                        'width': scope.width + 'px',
                        'height': scope.width + 'px',
                        'line-height': scope.width + 'px',
                        'font-size': (scope.width * 0.5) + 'px'
                    });
                    element.css({
                        'width': scope.width + 'px',
                        'height': scope.width + 'px'
                    });
                }

                function attachHandlers() {
                    dragEl = angular.element(element[0].querySelector('[ng-drag]'));
                    if (scope.photo) {
                        scope.onTouch = onTouch;
                        scope.onRelease = onRelease;
                        scope.onDropComplete = onDropComplete;
                    } else {
                        scope.onTouch = scope.onRelease = scope.onDropComplete = dummy;
                    }
                }

                function onTouch () {
                    dragEl.addClass('selected');
                }

                function onRelease() {
                    dragEl.hasClass('dragging') || scope.$emit('draggable.selected', scope.photo);
                    dragEl.removeClass('selected');
                }

                function onDropComplete (draggedPhoto) {
                    var dropPhoto = scope.photo;
                    scope.$emit('draggable.dropComplete', draggedPhoto, dropPhoto);
                }

                function dummy() {}
            }
        }
    }

    function cropModal() {
        return {
            restrict: 'A',
            scope: true,
            link: function (scope, element) {
                var canvas = element.find('canvas');
                var cropContainer = angular.element(element[0].querySelector('.crop-container'));

                var cropWidth = screen.width < scope.selectedPhoto.width ? screen.width : scope.selectedPhoto.width;
                scope.areaMinWidth = cropWidth / 1.5;

                scope.$watch('selectedPhoto', applyStyles);

                scope.onCropChange = function(crop) {
                    var scale = scope.selectedPhoto.height / canvas[0].height;
                    scope.currentCrop.height = crop.size * scale;
                    scope.currentCrop.width = crop.size * scale;
                    scope.currentCrop.x = crop.x * scale;
                    scope.currentCrop.y = crop.y * scale;
                };

                function applyStyles() {
                    var width = cropWidth;
                    var scale = width / scope.selectedPhoto.width;
                    var height = scope.selectedPhoto.height * scale;
                    cropContainer.css({
                        width: width + 'px',
                        height: height + 'px',
                        overflow: 'hidden'
                    });
                }
            }
        }
    }

    cropModalGetter.$inject = ['$ionicModal'];
    function cropModalGetter($ionicModal) {
        this.getModal = function(scope) {
            return $ionicModal.fromTemplateUrl('modules/main/settings/cropModal.html', {scope: scope})
                .then(function(modal) {
                    scope.$on('destroy', modal.remove);
                    return modal;
                })
        };

    }


})(angular);
