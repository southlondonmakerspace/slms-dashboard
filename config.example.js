module.exports = {
    'httpPort': 3000,
     'nrSecurityToken': 'xxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxx', // this is a security token from OpenLDBWS
     'nrLDBWSurl': 'https://lite.realtime.nationalrail.co.uk/OpenLDBWS/wsdl.aspx?ver=2016-02-16', // this is the SOAP endpoint for LWDB
     'tfl': {
       'appId': 'xxxxx',
       'appKey': 'xxxxx'
    },
     'lat': 51.451860, // latitude and longitude of the space
     'lon': -0.100861,
	 'radius': 250,
     'stationCRS': 'HNH',// this is the CRS code of the station you want to display the departure board for
     'icalAddress': 'https://calendar.google.com/calendar/ical/6hnjp743rq7omi2qfr3fa873ug%40group.calendar.google.com/public/basic.ics'
 }
