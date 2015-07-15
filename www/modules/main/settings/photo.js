(function(angular) {

    angular.module('app.main.settings')
        .service('photoSettingsWidthCalculator', photoSettingsWidthCalculator)
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


})(angular);
