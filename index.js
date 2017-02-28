const config = require('./config')

const DeparturesBoard = require('./lib/darwinDeparturesBoard')
const TFLAPI = require('./lib/tflAPI')

var depBoard = new DeparturesBoard(config.nrLDBWSurl, config.nrSecurityToken)
var tfl = new TFLAPI()

var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';
var activeWidgets = []

router.get("/", (req, res) => {
    res.sendFile(path + "index.html");
});

router.get('/trainDepartures', (req, res) => {
    depBoard.lookupDepBoard(config.stationCRS).then(
        (result) => {
            res.end(JSON.stringify(result))
        }).catch(
        (error) => {
            res.end('error' + error)
        })
})

router.get('/busDepartures', (req, res) => {
   var lookupPromises = []
   config.busStopNAPTANIDs.forEach( (naptan) => {
      lookupPromises.push(tfl.lookupBusDepartures(naptan))
   })
    Promise.all(lookupPromises).then(
        (results) => {
            res.end(JSON.stringify(results))
        }
    ).catch((error) => {
        res.end('error:' + error)
    })
})
/*router.get('/tubeStatus', (req, res) => {
   tfl.lookupStatuses('tube').then ( (data) => {
      res.end(JSON.stringify(data))
   }).catch((error) =>{
      res.end('error')
   })
})*/

//// TODO: make this load things dynamically somehow
require('./widgets/tubeStatus/routes.js')(router)
router.get('/tubeStatus/widget.html',function (req, res) {
   res.sendFile(__dirname + '/widgets/tubeStatus/widget.html')
})
router.use('/tubeStatus/', express.static('./widgets/tubeStatus/public'))
router.get('/tubeStatus/.*', express.static('./widgets/tubeStatus/public'))
activeWidgets.push('tubeStatus')

// provide a list of all widgets
router.get('/widgets', function (req, res) {
   res.end(JSON.stringify(activeWidgets))
})

router.get('/layout', function (req, res) {
   // serve a layout structure for the page to render
})

app.use("/", router);
app.use(express.static('public'))

app.use("*", (req, res) => {
    res.sendFile(path + "404.html");
});

app.listen(config.httpPort, () => {
    console.log("Live at Port " + config.httpPort);
});
