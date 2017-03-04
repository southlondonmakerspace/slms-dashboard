
widgetUpdates.push(function() {

    $.getJSON('/busStops', {}, function(data) {
        console.log('busDepartures: running')

        var stopList = data

        // keep a log of all the requests being made, so we can callback when they're all done
        var departureRequests = []
        // create a board of departures for each bus stop
        var departureBoard = {}
        stopList.forEach(function(stop) {
            // get the towards direction
            var towards = ""
            if (stop.hasOwnProperty('additionalProperties')) {
                stop.additionalProperties.forEach(function(property) {
                    if (property.key == 'Towards') {
                        towards = property.value
                    }
                })
            }
            stop.towards = towards
            //console.log(stop.indicator + " : " + stop.commonName + " towards " + towards)


            console.log("queuing request to " + '/busDeparturesList/' + stop.naptanId)
            departureRequests.push($.getJSON('/busDeparturesList/' + stop.naptanId, {}, function(departureData) {
               console.log("returned request to " + '/busDeparturesList/' + stop.naptanId)
               var stopHeader = $('<h3>')
               stopHeader.append($('<span>' + stop.stopLetter + '</span>').addClass('circle-icon red'))
               stopHeader.append($('<span>' + stop.commonName + " towards " + towards + '</span>').addClass('busTowards'))
               console.log("from stop " + stop.stopLetter + " : " + stop.commonName)
                var departures = departureData
                //console.log(departures)
                var services = {}
                departures.forEach(function(departure) {
                    var serviceKey = departure.lineId + ":" + departure.destinationName
                    if (services[serviceKey] == undefined) {
                        services[serviceKey] = []
                    }
                    services[serviceKey].push(departure)
                })

                var lineName, towards
               var departureList = $('<ul id="' + stop.stopLetter + "-" + stop.stopLetter + '">')
               departureBoard[stop.stopLetter + ":" + stop.commonName] = {
                  'stop': stop,
                  'departures': []
               }
               ,
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
                    departureBoard[stop.stopLetter + ":" + stop.commonName].departures.push({
                       'lineName': lineName,
                       'destination': destination,
                       'until': untilString
                    })
                    console.log(lineName, "to", destination, "in", untilString)

                })
            }))
        })
        $.when.apply(this,departureRequests).done(function () {
           console.log("all requests done")
           console.log(departureBoard)
           $('#busDepartures').empty()
          Object.keys(departureBoard).sort().forEach(function (stopKey) {
             var stop = departureBoard[stopKey].stop
             var stopHeader = $('<h3>')
             stopHeader.append($('<span>' + stop.stopLetter + '</span>').addClass('circle-icon red'))
             stopHeader.append($('<span>' + stop.commonName + " towards " + stop.towards + '</span>').addClass('busTowards'))
             $('#busDepartures').append(stopHeader)
             var departures = departureBoard[stopKey].departures
             var departureList =  $('<ul>').addClass('busDepartureList')
             departures.forEach(function (departure) {
                var departureLine = $('<li>').addClass('busStopDeparture')
                departureLine.append($('<span>' + departure.lineName + '</span>').addClass('busNumber'))
                departureLine.append($("<span> to " + departure.destination + "</span>").addClass('busTowards'))
                departureLine.append($("<span> in " + departure.until + " minutes </span>"))
                departureList.append(departureLine)
             })
             $('#busDepartures').append(departureList)
          })
           //$('#busDepartures').append(departureBoard)
        })

    })
})
