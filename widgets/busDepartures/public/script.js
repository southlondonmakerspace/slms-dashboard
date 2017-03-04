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
            console.log('busStops',$scope.stops)
            updateDepartures()
        })

        function updateDepartures() {
           var departureRequests = []
           $scope.stops.forEach(function (stop, index) {
             $scope.stops[index].departures = []
             departureRequests.push($http.get('/busDeparturesList/' + stop.naptanId).then(function (result) {
                console.log(result)
                var departures = result.data
                var services = {}
                departures.forEach(function(departure) {
                    var serviceKey = departure.lineId + ":" + departure.destinationName
                    if (services[serviceKey] == undefined) {
                        services[serviceKey] = []
                    }
                    services[serviceKey].push(departure)
                })
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
                    timesUntil.forEach(function(time) {
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
                    $scope.stops[index].departures.push({
                        'lineName': lineName,
                        'destination': destination,
                        'until': untilString
                    })
                    console.log(lineName, "to", destination, "in", untilString)

               })
             }))
          })
        }

        $interval(function() {
            updateDepartures()
        }, 30000)
    }
])
