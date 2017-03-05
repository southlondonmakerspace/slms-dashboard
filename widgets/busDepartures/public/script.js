var dashboard = angular.module('slmsDashboard')

dashboard.controller('BusDepartureController', ['$scope', '$http', '$interval',
    function($scope, $http, $interval) {
        $scope.stops = []
        $http.get('/busStops').then(function(result) {
            var stopList = result.data
            // keep a log of all the requests being made, so we can callback when they're all done
            var departureRequests = []
            // create a board of departures for each bus stop
            var departureBoard = {}
            $scope.stops = []
            stopList.forEach(function(stop) {
                if (stop.hasOwnProperty('additionalProperties')) {
                    stop.additionalProperties.forEach(function(property) {
                        if (property.key == 'Towards') {
                            stop.towards = property.value

                        }
                    })
                }
                $scope.stops.push(stop)
            })
            updateDepartures()
        })

        function updateDepartures() {
           console.log('[busDepartures]', 'updating')
            var departureRequests = []
            $scope.stops.forEach(function(stop, index) {
                departureRequests.push($http.get('/busDeparturesList/' + stop.naptanId).then(function(result) {
                    var departures = result.data
                    var services = {}
                    departures.forEach(function(departure) {
                        var serviceKey = departure.lineId + ":" + departure.destinationName
                        if (services[serviceKey] == undefined) {
                            services[serviceKey] = []
                        }
                        services[serviceKey].push(departure)
                    })
                    var newDepartures = []
                    Object.keys(services).forEach(function(serviceKey) {
                        var timesUntil = []
                        var service = services[serviceKey]
                        var destination
                        service.forEach(function(departure) {
                            lineName = departure.lineName
                            destination = departure.destinationName
                            timesUntil.push(departure.timeToStation)
                        })

                        var untilString = ""
                        var i = timesUntil.length
                        var earliestTime = 9999
                        timesUntil.sort(function (a,b) { return a-b;})
                        timesUntil.forEach(function(time) {
                            if (time < earliestTime) {
                                earliestTime = time
                            }
                            i--
                            untilString += Math.floor(time / 60) + " "
                            if (i != 0) {
                                if (i == 1) {
                                    untilString += " and "
                                } else {
                                    untilString += ", "
                                }
                            }
                        })

                        newDepartures.push({
                            'lineName': lineName,
                            'destination': destination,
                            'until': untilString,
                            'earliestTime': earliestTime
                        })
                    })
                    newDepartures.sort(function(a, b) {
                        if (a.earliestTime < b.earliestTime)
                            return -1;
                        if (a.earliestTime > b.earliestTime)
                            return 1;
                        return 0;
                    })
                    console.log('[busDepartures] new departures', newDepartures)
                    $scope.stops[index].departures = newDepartures
                }))
            })
        }

        $interval(function() {
            updateDepartures()
        }, 30 * 1000)
    }
])
