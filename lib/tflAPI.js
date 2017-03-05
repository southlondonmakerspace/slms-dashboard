// https://api.tfl.gov.uk/StopPoint/490001149B/arrivals
const request = require('request')
const moment = require('moment')
var TFLAPI = function(app_id,app_key) {
   this.app_id = app_id
   this.app_key = app_key
}
const TFL_ENDPOINT = 'https://api.tfl.gov.uk'

TFLAPI.prototype.makeAPIRequest = function (path, cb)
{
   var url = TFL_ENDPOINT + path
   if (this.app_id && this.app_key)
   {
      url += '&app_id' + this.app_id + '&app_key' + this.app_key
   }
   request(url, cb)
}

TFLAPI.prototype.lookupBusNAPTANStopPoints = function (lat, lon, radius) {
   return new Promise((fulfil, reject) =>
   {
         this.makeAPIRequest('/StopPoint?stopTypes=NaptanBusCoachStation,NaptanPublicBusCoachTram&radius=' + radius + '&lat=' + lat + '&lon=' + lon, (error, response, body) => {
            if (error)
            {
               reject(error)
               return
               }
            var results = JSON.parse(body)
            if (results.hasOwnProperty('stopPoints') != undefined)
            {
               fulfil(results.stopPoints)
            } else {
               reject('no results')
            }
         })
   })
}


TFLAPI.prototype.lookupBusDepartures = function(stopID) {

    return new Promise((fulfil, reject) => {
        this.makeAPIRequest('/StopPoint/' + stopID + '/arrivals', (error, response, body) => {
            if (error) {
                reject(error)
            } else {
               try {
                var result = JSON.parse(body)
             } catch (exception)
             {
                reject(exception)
             }
             if (result == undefined) {
                reject(result)
             }
                if (result.hasOwnProperty('httpStatus') && result.httpStatus != 200)
                {
                   reject(result.message)
                   return
                }

                result.sort((a, b) => {
                    if (a.timeToStation > b.timeToStation)
                        return -1;
                    if (a.timeToStation < b.timeToStation)
                        return 1
                    return 0
                })
                // return only the next 4
                result = result.slice(0, 10)
                fulfil(result)
            }
        })
    })
}

TFLAPI.prototype.lookupStatuses = function(mode) {
    return new Promise((fulfil, reject) => {
        this.makeAPIRequest('/Line/Mode/' + mode + '/Status', (error, response, body) => {
            if (error) {
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
    /*tflapi.lookupBusDepartures('490001149B').then((result) => {
        console.log(JSON.stringify(result))
    })*/
    tflapi.lookupBusNAPTANStopPoints(config.lat,config.lon,350).then( (result) => { console.log(result)})
}
