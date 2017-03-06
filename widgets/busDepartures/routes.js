const TFLAPI = require('../../lib/tflAPI')
const config = require('../../config')
module.exports = function (router) {
   console.log(config)
   var tfl = new TFLAPI(config.tfl.appId,config.tfl.appKey)
   router.get('/busStops', (req, res) => {
       tfl.lookupBusNAPTANStopPoints(config.lat, config.lon, config.radius).then((result) => {
           res.status(200).end(JSON.stringify(result))
       }).catch((error) => {
           res.status(500).end(error)
       })
   })

   router.get('/busDeparturesList/:naptan', (req, res) => {
       tfl.lookupBusDepartures(req.params['naptan']).then(
           (results) => {
               res.status(200).end(JSON.stringify(results))
           }
       ).catch((error) => {
           res.status(500).end('error: '  + error)
       })
   })
}
