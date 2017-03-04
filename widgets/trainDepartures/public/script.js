//widgetUpdates.push(function() {
var dashboard = angular.module('slmsDashboard')
dashboard.controller('TrainDepartureController', ['$scope', '$http', '$interval',
    function($scope, $http, $interval) {
        $scope.departures = []
        $interval(function() {
           updateBoard()
        }, 10000)
        function updateBoard() {
            $http.get('/trainDepartures').then(function(result) {
                var board = result.data.GetStationBoardResult
                if (board == undefined) {
                    console.error(board)
                    return
                }
                if (board.nrccMessages != undefined) {
                   $scope.message = ""
                   $scope.showMessage = true
                    board.nrccMessages.message.forEach(function(message) {
                        $scope.message += "..." + message
                    })
                } else {
                   $scope.showMessage = false
                }
                $scope.locationName = board.locationName
                var departures = []
                board.trainServices.service.forEach(function(departure) {
                    var modified = departure
                    if (departure.destination.location.constructor === Array) {
                        modified.destinationName = departure.destination.location[0].locationName
                    } else {
                        modified.destinationName = departure.destination.location.locationName
                    }
                    departures.push(modified)
                })
                $scope.departures = departures
                console.log($scope.departures)
            })
        }
        updateBoard()
    }
])
