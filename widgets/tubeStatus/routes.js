const TFLAPI = require('../../lib/tflAPI')
const config = require('../../config')
module.exports = function (router) {
   var tfl = new TFLAPI(config.tfl.app_id,config.tfl.app_key)
   router.get('/tubeStatus', (req, res) => {
      tfl.lookupStatuses('tube').then ( (data) => {
         res.end(JSON.stringify(data))
      }).catch((error) =>{
         res.end('error')
      })
   })
}
