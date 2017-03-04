const TFLAPI = require('../../lib/tflAPI')
const config = require('../../config')
module.exports = function (router) {
   var tfl = new TFLAPI(config.tfl.app_id,config.tfl.app_key)
   router.get('/busStops', (req, res) => {
       tfl.lookupBusNAPTANStopPoints(config.lat, config.lon, 150).then((result) => {
           res.end(JSON.stringify(result))
       }).catch((error) => {
           res.end(500, error)
       })
   })

   router.get('/busDeparturesList/:naptan', (req, res) => {
       tfl.lookupBusDepartures(req.params['naptan']).then(
           (results) => {
               res.end(JSON.stringify(results))
           }
       ).catch((error) => {
           res.end('error: '  + error)
       })
   })
}
