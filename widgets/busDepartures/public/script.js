var dashboard = angular.module('slmsDashboard')

dashboard.controller('BusDepartureController', ['$scope', '$http', '$interval', '$q',
    function($scope, $http, $interval, $q) {
        $scope.count = 0

        function getStops() {
            console.log('[busDepartures]: getting list of bus stops')
            $scope.stops = []
            $http.get('/busStops').then(function(result) {
                console.log('[busDepartures]: bus stops retrieved')
                var stopList = result.data
                $scope.stops = {}
                stopList.forEach(function(stop) {
                    if (stop.hasOwnProperty('additionalProperties')) {
                        stop.additionalProperties.forEach(function(property) {
                            if (property.key == 'Towards') {
                                stop.towards = property.value
                            }
                        })
                    }
                    if ($scope.stops[stop.commonName] == undefined) {
                        $scope.stops[stop.commonName] = {}
                        $scope.stops[stop.commonName].name = stop.commonName
                        $scope.stops[stop.commonName].stations = []
                    }
                    $scope.stops[stop.commonName].stations.push(stop)
                })
                // sort the stops by name
                /*$scope.stops.sort(function (a, b){
                   if( a.commonName < b.commonName )
                   return -1
                   if (a.commonName > b.commonName)
                   return 1
                   return 0
                })*/
                updateDepartures()
            })
        }
        getStops()

        function updateDepartures() {
            console.log('[busDepartures]', 'updating')
            $scope.count++
            if (($scope.count % 10) ==0)
            {
               getStops()
            }
                var scopeCopy = JSON.parse(JSON.stringify($scope.stops)) // copy stops
            var queryPromises = []
            Object.keys(scopeCopy).forEach(function(stopGroupName, stopGroupIndex) {
                var stopGroup = scopeCopy[stopGroupName]
                //console.log('[busDepartures]', 'looking up departures for ', stopGroupName)
                stopGroup.stations.forEach(function(stop, stopIndex) {
                    //console.log('[busDepartures]', 'looking up specific departures for ', stop)
                    queryPromises.push($http.get('/busDeparturesList/' + stop.naptanId).then(function(result) {
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

                            timesUntil.sort(function(a, b) {
                                return a - b;
                            })
                            var earliestTime = timesUntil[0]
                            var numTimes = 0;
                            var i = 0
                            const MAX_TIMES_TO_SHOW = 2
                            var numTimesToShow = (timesUntil.length <= MAX_TIMES_TO_SHOW) ? timesUntil.length : MAX_TIMES_TO_SHOW;
                            for (i = 0; i < numTimesToShow; i++) {
                                var time = timesUntil[i]
                                untilString += Math.floor(time / 60)
                                if (i < numTimesToShow) {
                                    if (i == numTimesToShow - 2) {
                                        untilString += " and "
                                    } else {
                                        if (i != numTimesToShow - 1) {
                                            untilString += ", "
                                        }
                                    }
                                }
                            }

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
                        //console.log('[busDepartures] new departures', stopGroupName, stopIndex, newDepartures)
                        scopeCopy[stopGroupName].stations[stopIndex].departures = newDepartures
                    }))

                })
            })
            $q.all(queryPromises).then(function() {
                // now... once we have all the departures, we need to go through each service, and look for the one in each direction with
                // minimum distance, and flag that one so we can display just the closest service
                var closestService = {}
                console.log('[busDepartures]', 'all HTTP departure board queries are finished')
                Object.keys(scopeCopy).forEach(function(stopGroupName, stopGroupIndex) {

                    var stopGroup = scopeCopy[stopGroupName]
                    stopGroup.stations.forEach(function(stop, stopIndex) {
                        if (stop.departures == undefined)
                            return
                        stop.departures.forEach(function(departure, departureIndex) {
                            var serviceKey = departure.lineName + ":" + departure.destination
                            if (closestService[serviceKey] == undefined) // never seen this service before
                            {
                                closestService[serviceKey] = {
                                    distance: stop.distance,
                                    stopIndex: stopIndex,
                                    stopGroupName: stopGroupName,
                                    departureIndex: departureIndex
                                }
                            }
                            if ((closestService[serviceKey].distance > stop.distance)) {
                                closestService[serviceKey] = {
                                    distance: stop.distance,
                                    stopIndex: stopIndex,
                                    stopGroupName: stopGroupName,
                                    departureIndex: departureIndex
                                }
                            }
                        })
                    })
                })

                Object.values(closestService).forEach(function(service) {
                    scopeCopy[service.stopGroupName].stations[service.stopIndex].departures[service.departureIndex].closest = true
                })
                console.log('[busDepartures]', 'after updating scope', scopeCopy)

                // now, finally - remove any stops that have no busses that are the closest
                Object.keys(scopeCopy).forEach(function(stopGroupName) {
                    var stopGroup = scopeCopy[stopGroupName]
                    stopGroup.stations.forEach(function(station, stationIndex) {
                        var closestServices = 0
                        station.departures.forEach(function(departure) {
                            if (departure.closest) {
                                closestServices++
                            }
                        })
                        if (closestServices == 0) {
                            console.log('[busDepartures]', 'deleting', stopGroupName, station)
                            delete scopeCopy[stopGroupName]
                        }
                    })

                })
                $scope.stops = scopeCopy

            })
            // out here
        }


        $interval(function() {
            updateDepartures()
        }, 30 * 1000)
    }
])
