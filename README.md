# South London Makerspace dashboard
The purpose of this software is to provide a dashboard for display within the [South London Makerspace](http://southlondonmakerspace.org)

It will ideally include:
 * Train/Bus departures from nearby
 * Latest event from the membership system (door opening, for example)
 * Latest discussions on Discourse
 * ???
 * profit

## Configuration
We're using the oldskool method of a config.js file to do the configuration. You'll need to create this before you run it. There's an example shown in config.example.js (just rename it to config.js and edit it).  It should look something like this:

         module.exports = {
             'httpPort': 3000,
             'nrSecurityToken': 'my-securitty-token', // this is a security token from OpenLDBWS http://realtime.nationalrail.co.uk/OpenLDBWSRegistration
             'nrLDBWSurl': 'https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2016-02-16', // this is the SOAP endpoint for LWDB
             'stationCRS': 'HNH' // this is the CRS code of the station you want to display the departure board for
             'busStopNAPTANIDs': [ // these are the bus stop NAPTAN IDs for some nearby bus stops.
                 '490001149B',
                 '490015248C',
                 '490001149L',
                 '490001149N'
             ]
         }

## Running
You can run this by doing the following:

         npm start

You can then access the UI using http://localhost:3000/  
