// https://api.tfl.gov.uk/StopPoint/490001149B/arrivals
const request = require('request')
const moment = require('moment')
var TFLAPI = function () {

}

TFLAPI.prototype.lookupBusDepartures = function (stopID)
{
   return new Promise((fulfil, reject) => {
      request('https://api.tfl.gov.uk/StopPoint/' + stopID + '/arrivals',(error, response, body) => {
         if (error)
         {
            reject(error)
         } else {
            var result = JSON.parse(body)

            result.forEach( (departure) => {
               departure.timeTill = moment(departure.expectedArrival).fromNow()
            })
            result.sort( (a,b) => {
               if (a.timeToStation > b.timeToStation)
               return -1;
               if (a.timeToStation < b.timeToStation)
               return 1
               return 0
            })
            // return only the next 4
            result = result.slice(0,4)
            fulfil(result)
         }
      })
   })
}

module.exports = TFLAPI

if (require.main === module) {
    var config = require('../config')
    var tflapi = new TFLAPI()
    tflapi.lookupBusDepartures('490001149B').then((result) => {
      console.log(JSON.stringify(result))
   })
}
