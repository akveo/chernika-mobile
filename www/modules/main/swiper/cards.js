/**
 * Created by vl on 31.3.15.
 */
(function(angular) {

    angular.module('app.main.swiper')
        .factory('accountData', !isTesting ? accountData : accountDataFake)
        .controller('swiperController', swiperController);

    accountData.$inject = [];
    function accountData() {
        return {

        };
    }

    accountDataFake.$inject = ['$q'];
    function accountDataFake($q) {
        return {
            getPeopleSuggestions: function() {
                return $q.when([
                    {
                        name: 'Asa',
                        age: 29,
                        photo: 'img/fake/asa.jpg'
                    },
                    {
                        name: 'Leanna',
                        age: 42,
                        photo: 'img/fake/leanna.jpg'
                    },
                    {
                        name: 'Esperanza',
                        age: 31,
                        photo: 'img/fake/esperanza.jpg'
                    },
                    {
                        name: 'Gianna',
                        age: 31,
                        photo: 'img/fake/gianna.jpg'
                    },
                    {
                        name: 'Sasha',
                        age: 27,
                        photo: 'img/fake/sasha.jpg'
                    }
                ]);
            }
        };
    }

    swiperController.$inject = ['$scope', 'peopleSuggestions'];
    function swiperController($scope, peopleSuggestions) {
        var vm = this;

        $scope.hello = 'world';

        $scope.suggestions = peopleSuggestions;

        $scope.bitchMoving = function(bitch, deltaX, deltaY) {
            console.log('moving');

            bitch.translateStyle = 'translate3d(' + deltaX + 'px,' + deltaY + 'px, 0)';
        };


        $scope.bitchMoved = function(bitch, deltaX, hDir) {
            if (Math.abs(deltaX) > 50) {
                if (hDir == 'r') {
                    approvedBitches.push(bitch);
                }
                $timeout(function() {
                    vm.bitchesData = vm.bitchesData.slice(0, vm.bitchesData.length - 1);
                    if (vm.bitchesData.length === 0) {
                        $state.go('likedBitches');
                    }
                }, 20);
                bitch.zIndex = -1;
            }
            delete bitch.translateStyle;
        };
    }

})(angular);