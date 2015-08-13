(function(angular) {

    angular.module('app.main.settings')
        .service('photoSettingsWidthCalculator', photoSettingsWidthCalculator)
        .service('cropModalGetter', cropModalGetter)
        .directive('draggablePhoto', draggablePhoto)
        .directive('cropModal', cropModal)
        .controller('PhotoSettingsController', PhotoSettingsController);

    PhotoSettingsController.$inject = ['$scope', '$rootScope', 'photoSettingsWidthCalculator', 'cropModalGetter', 'userApi', 'onConnectionChangePropertyListener', 'onLoadingPropertyListener'];
    function PhotoSettingsController($scope, $rootScope, photoSettingsWidthCalculator, cropModalGetter, userApi, onConnectionChangePropertyListener, onLoadingPropertyListener) {
        $scope.selectedPhoto = {};
        $scope.initialCrop = {};

        $scope.$on('draggable.selected', onDraggableSelected);
        $scope.$on('draggable.dropComplete', onDropComplete);

        cropModalGetter.getModal($scope)
            .then(function(modalController) {
               $scope.cropModalController = modalController;
            });

        onConnectionChangePropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onGoodConnection: true,
            onBadConnection: false
        });

        onLoadingPropertyListener.listen($scope, {
            prop: 'isContentSeen',
            onSuccess: true,
            onStart: false
        });

        $scope.$on('connection.on', load);

        load();

        $scope.closeCrop = function () {
            $scope.$broadcast('cropModal.hide')
        };

        $scope.showCrop = function () {
            $scope.$broadcast('cropModal.show')
        };

        $scope.saveCrop = function () {
            $scope.$broadcast('crop.save');
        };

        $scope.$on('crop.saved', onCropSaved);

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

        function onCropSaved(evt) {
            evt.stopPropagation();
            savePhotos();
            $scope.closeCrop();
        }

        function onDraggableSelected(evt, photo) {
            evt.stopPropagation();
            $scope.selectedPhoto = photo;
            $scope.showCrop()
        }

        function savePhotos() {
            return userApi.savePhotos($scope.photos)
                .then(function () {
                    $rootScope.$broadcast('settings.photos.changed');
                })
        }

        function load() {
            $scope.$broadcast('connection.loading.start', {api: 'userApi', method: 'getPhotos'});
            userApi.getPhotos()
                .then(function (photos) {
                    $scope.photos = photos;
                    $scope.photosWidth = photoSettingsWidthCalculator.calculate();
                    $scope.$broadcast('connection.loading.success', {api: 'userApi', method: 'getPhotos'});
                }, function (error) {
                    $scope.$broadcast('connection.loading.error', {api: 'userApi', method: 'getPhotos', error: error});
                });
        }
    }

    photoSettingsWidthCalculator.$inject = [];
    function photoSettingsWidthCalculator() {
        var screenWidth = document.documentElement.clientWidth || screen.width;
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
                scope.currentCrop = {};

                scope.$watch('selectedPhoto', onNewPhoto);

                scope.onCropChange = function(crop) {
                    angular.extend(scope.currentCrop, crop);
                };

                scope.$on('crop.save', function () {
                    angular.extend(scope.selectedPhoto.crop, scope.currentCrop);
                    scope.$emit('crop.saved', scope.selectedPhoto.crop);
                });

                scope.$on('cropModal.show', function () {
                    angular.extend(scope.initialCrop, scope.selectedPhoto.crop);
                    scope.cropModalController.show();
                });

                scope.$on('cropModal.hide', function () {
                    scope.cropModalController.hide();
                });

                function onNewPhoto(newP) {
                    angular.extend(scope.initialCrop, newP.crop);
                    applyStyles();
                }

                function applyStyles() {
                    var width = screen.width < scope.selectedPhoto.width ? screen.width : scope.selectedPhoto.width;
                    var scale = width / scope.selectedPhoto.width;
                    var height = scope.selectedPhoto.height * scale;
                    scope.areaMinWidth = width / 1.5;
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
