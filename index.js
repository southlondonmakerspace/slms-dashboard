const config = require('./config')

const DeparturesBoard = require('./lib/darwinDeparturesBoard')
const TFLAPI = require('./lib/tflAPI')
var depBoard = new DeparturesBoard(config.nrLDBWSurl, config.nrSecurityToken)
var tfl = new TFLAPI()

var express = require("express");
var app = express();
var router = express.Router();
var path = __dirname + '/views/';


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


app.use("/", router);

app.use("*", (req, res) => {
    res.sendFile(path + "404.html");
});

app.listen(config.httpPort, () => {
    console.log("Live at Port " + config.httpPort);
});
