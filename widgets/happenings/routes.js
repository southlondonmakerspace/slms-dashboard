const config = require('../../config')
const Happenings = require('../../lib/happenings')
module.exports = function (router) {
   var happenings = new Happenings(config.icalAddress)
   router.get('/nowAndNext', (req, res) => {
      console.log("getting", config.icalAddress)
      happenings.nowAndNext().then(function (result ) {
         res.end(JSON.stringify(result))
      })
   })
}
