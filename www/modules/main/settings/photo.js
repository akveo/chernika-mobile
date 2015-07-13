(function(angular) {

    angular.module('app.main.settings')
        .controller('PhotoSettingsController', PhotoSettingsController);

    PhotoSettingsController.$inject = ['$scope', 'userPhotos'];
    function PhotoSettingsController($scope, userPhotos) {
        $scope.photos = userPhotos;
    }


})(angular);
