$.getJSON('/tubeStatus', {}, function(data) {
   var statusTable = $('<ul>')
   data.forEach(function(line) {
        console.log(line)
        var statusLine = $('<li><div>')
        statusLine.append($('<div>' + line.name + '</div>').addClass('tubeLabel').addClass('tube-' + line.id))
        statusLine.append($('<div>' + line.lineStatuses[0].statusSeverityDescription + '</div>').addClass('tubeServiceLevel'))
        statusLine.addClass('tubeStatusLine')
        statusTable.append(statusLine)
   })
   $('#tubeStatus').html(statusTable)
})
