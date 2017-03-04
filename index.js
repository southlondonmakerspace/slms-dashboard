const config = require('./config')

const DeparturesBoard = require('./lib/darwinDeparturesBoard')
const TFLAPI = require('./lib/tflAPI')
const fs = require('fs')
const path = require('path')
const bunyan  = require('bunyan')


var express = require("express");

const log = bunyan.createLogger({name: 'slms-dashboard'});

var app = express();
var router = express.Router();
var viewPath = __dirname + '/views/';
var activeWidgets = []

router.get("/", (req, res) => {
    res.sendFile(viewPath + "index.html");
});

// load all of the available widgets
fs.readdir(path.join(__dirname,'/widgets'), (err, entries) => {
   if (err)
   {
      log.error("Can't load widgets: " + err)
      process.exit(5)
   }
   entries.forEach( (entry) => {
      var widgetName = entry
      fs.stat(path.join(__dirname,'/widgets/', entry), (err, stats) => {
         if (err)
         {
            log.error("Couldn't stat entry " + entry + ": " + err)
         }
         if (stats.isDirectory())
         {
            var widgetPath = path.join(__dirname,'/widgets/', entry)
            log.info('Found widget:', widgetName, widgetPath)
            require(path.join(widgetPath,'routes.js'))(router)
            router.get('/' + widgetName + '/widget.html', function(req, res) {
                res.sendFile(path.join(widgetPath,'widget.html'))
            })
            router.use('/' + entry + '/', express.static(path.join(widgetPath,'public')))
            router.get('/' + entry + '/.*', express.static(path.join(widgetPath,'public')))
            activeWidgets.push(widgetName)
         }
      })
   })
})

// provide a list of all widgets
router.get('/widgets', function(req, res) {
    res.end(JSON.stringify(activeWidgets))
})

router.get('/layout', function(req, res) {
   //TODO: make this actually do something :)
    // serve a layout structure for the page to render
})
app.use(require('express-bunyan-logger').errorLogger());
app.use('/bower_components', express.static(path.join(__dirname, 'bower_components/')))
app.use("/", router);
app.use(express.static('public'))

app.use("*", (req, res) => {
    res.sendFile(path + "404.html");
});

app.listen(config.httpPort, () => {
    console.log("Live at Port " + config.httpPort);
});
