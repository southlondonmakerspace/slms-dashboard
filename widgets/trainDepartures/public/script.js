widgetUpdates.push(function() {
    $.getJSON('/trainDepartures', {}, function(data) {
        console.log('trainBoard running')
        var trainBoard = $('<div>').addClass('trainBoard')

        var board = data.GetStationBoardResult
        if (board.nrccMessages != undefined) {
            board.nrccMessages.message.forEach(function(message) {
                trainBoard.append($('<div role="alert">' + message + '</div>').addClass('alert').addClass('alert-warning'))
            })
        }
        trainBoard.append($('<h3>' + data.GetStationBoardResult.locationName + '</h3>'))
        var stationName = data.GetStationBoardResult.locationName
        var services = data.GetStationBoardResult.trainServices.service
        var departureBoard = $('<ul>')
        services.forEach(function(service) {
            var myDeparture = $('<li>')
            myDeparture.append($('<div>' + service.std + '</div>').addClass('trainTime'))
            myDeparture.append($('<span>' + service.operator + '</span>').addClass('toc').addClass('toc-' + service.operatorCode))
            //myDeparture.append($('<span style="padding-left:12pt;padding-right:12pt"> to </span>'))
            if (service.destination.location.constructor === Array) {
                myDeparture.append($('<span>' + service.destination.location[0].locationName + '</span>'))
            } else {
                myDeparture.append($('<span>' + service.destination.location.locationName + '</span>'))
            }

            myDeparture.append($('<span> (Platform ' + service.platform + ')</span>').addClass('trainPlatform'))
            myDeparture.append($('<div> ( ' + service.etd + ' )</div>').addClass('trainEtd'))

            departureBoard.append(myDeparture)
        })
        trainBoard.append(departureBoard)
        $('#trainDepartures').html(trainBoard)

    })
})
