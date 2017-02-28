const TFLAPI = require('../../lib/tflAPI')
module.exports = function (router) {
   var tfl = new TFLAPI()
   router.get('/tubeStatus', (req, res) => {
      tfl.lookupStatuses('tube').then ( (data) => {
         res.end(JSON.stringify(data))
      }).catch((error) =>{
         res.end('error')
      })
   })
}
