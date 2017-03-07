//widgetUpdates.push(function() {
var dashboard = angular.module('slmsDashboard')
dashboard.controller('TrainDepartureController', ['$scope', '$http', '$interval', '$sce',
    function($scope, $http, $interval, $sce) {
        $scope.departures = []
        $interval(function() {
            updateBoard()
        }, 10000)

        function updateBoard() {
            $http.get('/trainDepartures').then(function(result) {
                var board = result.data.GetStationBoardResult
                if (board == undefined || result.data == undefined) {
                    console.error('[trainDepartures] invalid board recieved', result.data)
                    return
                }
                if (board.nrccMessages != undefined) {
                   var myMessage = ""
                    $scope.showMessage = true
                    board.nrccMessages.message.forEach(function(message) {
                        myMessage += message
                    })
                    console.log('message', myMessage)
                    $scope.message = $sce.trustAsHtml(myMessage)
                } else {
                    $scope.showMessage = false
                }
                $scope.locationName = board.locationName
                var departures = []
                if (board.trainServices != undefined) {
                    board.trainServices.service.forEach(function(departure) {
                        var modified = departure
                        if (departure.destination.location.constructor === Array) {
                            modified.destinationName = departure.destination.location[0].locationName
                        } else {
                            modified.destinationName = departure.destination.location.locationName
                        }
                        var relativeTime = moment(modified.std,"HH:mm")
                        // if the time is in the past, then either the train is delayed, or it's actually talking about a train that departs after midnight
                        if (relativeTime.isBefore(moment()))
                        {
                           // right. if the hour is before 4AM, then it's talking about a train after midnight
                           if (relativeTime.hour() <= 4)
                           {
                              relativeTime.add(1,'day')
                           }
                           // otherwise, it actually IS the time it says it is
                        }
                        modified.relativeTime = relativeTime.fromNow(true)
                        console.log('[trainDepartures]','departure',modified.std,modified.relativeTime)

                        departures.push(modified)
                    })
                }
                $scope.departures = departures
                console.log('[trainDepartures] new departures', $scope.departures)
            })
        }
        updateBoard()
    }
])
