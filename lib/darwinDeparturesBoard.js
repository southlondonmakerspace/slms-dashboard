const soap = require('soap')
const bunyan  = require('bunyan')
const log = bunyan.createLogger({name: 'slms-dashboard-darwin'});

var DeparturesBoard = function(endpoint,tokenKey) {
    // create a new departures board
    this.tokenKey = tokenKey
    this.endpoint = endpoint
    return this
}

DeparturesBoard.prototype.lookupDepBoard = function(crs, numRows) {
    var self = this
    if (numRows == undefined)
      numRows = 10
    return new Promise(function(fulfil, reject) {
        soap.createClient(
            self.endpoint, {},
            (err, client) => {
               if (err)
               {
                  log.error('Error communicating with Darwin', err)
                  reject(err)
                  return
               }
                client.addSoapHeader({
                    'tok:AccessToken': {
                        'tok:TokenValue': self.tokenKey
                    }
                })
                client.GetDepartureBoard({
                    'numRows': numRows,
                    'crs': crs,
                    'timeOffset': 0,
                    'timeWindow': 120
                }, (err, result) => {
                    if (err) {
                        reject(err)
                    } else {
                        fulfil(result)
                    }

                })
            }
        )
    })
}

module.exports = DeparturesBoard

if (require.main === module) {
    var config = require('../config')
    var depboard = new DeparturesBoard(config.nrLDBWSurl,config.nrSecurityToken)
    depboard.lookupDepBoard('HNH',10).then((result) => {
      console.log(JSON.stringify(result))
   })
}
