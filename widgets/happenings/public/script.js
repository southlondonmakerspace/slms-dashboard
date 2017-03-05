var dashboard = angular.module('slmsDashboard')

dashboard.controller('NowAndNextController', ['$scope', '$http', '$interval',
    function($scope, $http, $interval) {
        function updateNowAndNext() {
            console.log('[nowAndNext] updating')
            $http.get('/nowAndNext/').then(function(result) {
                console.log('[nowAndNext] got result', result.data)
                $scope.now = result.data.now
                $scope.next = result.data.next
            })
        }
        updateNowAndNext()
        $interval(updateNowAndNext, 30 * 1000)
    }
])
