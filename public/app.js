var dashboard = angular.module('slmsDashboard', ['ds.clock'])

dashboard.controller('HeaderController', ['$scope', '$timeout',
    function($scope) {
}
])

function updateBoards() {
    widgetUpdates.forEach(function(fn) {
        fn()
    })
}

var widgetUpdates = []

// get a list of all the available widgets
$.getJSON('/widgets', {}, function(data) {
    // make some promises - when all widgets have completed loading ...
    var widgetPromises = []
    data.forEach(function(widget) {
        widgetPromises.push(new Promise(function(fulfil, reject) {
            if ($('#for-' + widget).length) {
                // load the CSS for this widget (if there is any)
                $.get('/' + widget + '/style.css', {}).done(function(data, textStatus, jqXHR) {
                    console.log('[' + widget + ']' + ": loaded css successfully")
                    $('<link>')
                        .appendTo('head')
                        .attr({
                            type: 'text/css',
                            rel: 'stylesheet',
                            href: '/' + widget + '/style.css'
                        });
                }).fail(function(jqxhr, settings, exception) {
                    console.error('[' + widget + ']' + ":  error loading script, " + exception)
                });



                $.getScript('/' + widget + '/script.js', function() {
                    console.log('[' + widget + ']' + ": loaded script successfully")
                    $('#for-' + widget).load('/' + widget + '/widget.html', function(response, status, xhr) {
                        if (status == "error") {
                            var msg = "Sorry but there was an error loading the partial HTML ";
                            console.log('[' + widget + ']:' + msg)
                            reject()
                        } else {
                            console.log('[' + widget + ']' + ": loaded html partial successfully")
                            // load the Javascript
                            fulfil()

                        }
                    })
                })
                // load the HTML partial and stick it into an element named for-$widgetName

            } else {
                fulfil()
            }
        }))
    })
    Promise.all(widgetPromises).then(function() {
        angular.element(document).ready(function() {
            angular.bootstrap(document, ['slmsDashboard']);
        });
        setInterval(function() {
            updateBoards()
        }, 30 * 1000)
        setTimeout(function() {
            updateBoards()
        }, 1000)
    })

})
