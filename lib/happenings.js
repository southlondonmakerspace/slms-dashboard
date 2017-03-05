const ical = require('ical')
const moment = require('moment')
var Happenings = function(icalAddress) {
    this.icalAddress = icalAddress
}

function isItHappeningNow(startTime, endTime) {
    const rightNow = moment()
    if (startTime.isBefore(rightNow) && endTime.isAfter(rightNow)) {
        return true
    } else {
        return false
    }
}

function isItHappeningInTheFuture(startTime, endTime) {
    const rightNow = moment()
    if (startTime.isAfter(rightNow)) {
        return true
    } else {
        return false
    }
}

function sensibleEvent(ev) {
    return {
        'summary': ev.summary,
        'description': ev.description,
        'start': ev.start,
        'end': ev.end
    }
}

Happenings.prototype.nowAndNext = function() {

    return new Promise((fulfil, reject) => {
        ical.fromURL(this.icalAddress, {}, (err, data) => {
            if (err) {
                reject(err)
            }
            var futureEvents = []
            var nowEvents = []
            for (var k in data) {

                if (data.hasOwnProperty(k)) {
                    var ev = data[k]
                    //console.log(ev.summary)
                    //console.log(ev)
                    var startTime = moment(ev.start)
                    ev.startTime = startTime
                    var endTime = moment(ev.end)
                    ev.endTime = endTime
                    var duration = endTime.diff(startTime)
                    if (ev.rrule) {
                        // recurrences
                        var nextRecurrence = ev.rrule.after(
                            moment().startOf('day').toDate(),
                            true
                        )
                        if (nextRecurrence != null) {
                            var rStartTime = moment(nextRecurrence)
                            var rEndTime = rStartTime.clone().add(duration)
                            ev.start = rStartTime
                            ev.end = rEndTime
                            //console.log(ev.summary,rStartTime,rEndTime)
                            if (isItHappeningNow(rStartTime, rEndTime)) {
                                nowEvents.push(sensibleEvent(ev))
                            }
                            if (isItHappeningInTheFuture(rStartTime, rEndTime)) {
                                futureEvents.push(sensibleEvent(ev))
                            }
                        }
                    } else {
                        // single event
                        //console.log(ev.summary,startTime,endTime)
                        if (isItHappeningNow(startTime, endTime)) {
                            nowEvents.push(sensibleEvent(ev))
                        }
                        if (isItHappeningInTheFuture(startTime, endTime)) {
                            futureEvents.push(sensibleEvent(ev))
                        }
                    }
                }
            }
            futureEvents.sort(function compareMilli(a, b) {
                if (a.start.valueOf() < b.start.valueOf()) return -1;
                if (a.start.valueOf() > b.start.valueOf()) return 1;
                return 0;
            })
            fulfil({
                'now': nowEvents,
                'next': futureEvents
            })
        })
    })
}

module.exports = Happenings

if (require.main === module) {
    var config = require('../config')
    var happenings = new Happenings(config.icalAddress)
    happenings.nowAndNext().then((result) => {
      console.log("----NOW----")
      result.now.forEach((event) => {
         console.log(event.summary, event.start, event.end)
      })
      console.log("----NEXT----")
        result.next.forEach(function(event) {
            console.log(event.summary, event.start, event.end)
        })
    })
}
