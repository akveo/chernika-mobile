(function(angular) {

    angular.module('app.main.settings')
        .service('photoSettingsWidthCalculator', photoSettingsWidthCalculator)
        .controller('PhotoSettingsController', PhotoSettingsController);

    PhotoSettingsController.$inject = ['$scope', 'userPhotos', 'photoSettingsWidthCalculator', '$rootScope'];
    function PhotoSettingsController($scope, userPhotos, photoSettingsWidthCalculator, $rootScope) {
        $scope.photos = userPhotos;
        $scope.photosWidth = photoSettingsWidthCalculator.calculate();

        $scope.onDropComplete=function(data,evt){
            var draggedPhotoIndex = $scope.photos.indexOf(data);
            $scope.photos[draggedPhotoIndex] = $scope.photos[0];
            $scope.photos[0] = data;
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
