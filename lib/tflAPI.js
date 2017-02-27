// https://api.tfl.gov.uk/StopPoint/490001149B/arrivals
const request = require('request')

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
            fulfil(JSON.parse(body))
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
