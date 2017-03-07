const config = require('../../config')
const DeparturesBoard = require('../../lib/darwinDeparturesBoard')

module.exports = function(router) {
   var depBoard = new DeparturesBoard(config.nrLDBWSurl, config.nrSecurityToken)
    router.get('/trainDepartures', (req, res) => {
      console.log('hello, from traindepartures')
        depBoard.lookupDepBoard(config.stationCRS).then(
            (result) => {
                res.end(JSON.stringify(result))
            }).catch(
            (error) => {
                res.end('error' + JSON.stringify(error))
            })
    })
}
