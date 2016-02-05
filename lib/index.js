/**
 * Created by shaoh on 2/3/2016.
 */
var map;
var timeLine;

/**
 * Trigger this function on page is loaded
 */
function loadPage(){
    map = L.map('map').setView([0, -20], 2);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        minZoom: 2,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiaHVzaGFvIiwiYSI6ImNpazd3YnYweTAwZmt1cWtubnlnbTRwaWUifQ.uU_WfyoPGEIIvEQ_retWeg'
    }).addTo(map);
    $(map.zoomControl.getContainer()).css({top:"60px"})

    var bandInfos = [
        Timeline.createBandInfo({
            width:          "70%",
            intervalUnit:   Timeline.DateTime.MONTH,
            intervalPixels: 100
        }),
        Timeline.createBandInfo({
            width:          "30%",
            intervalUnit:   Timeline.DateTime.YEAR,
            intervalPixels: 200
        })
    ];
    bandInfos[1].syncWith = 0;
    timeLine = Timeline.create(document.getElementById("timeLine"), bandInfos);

    //// set the map to our custom style
    //// make a custom map style
    //var styledMapType = new google.maps.StyledMapType([
    //    {
    //        featureType: "water",
    //        elementType: "all",
    //        stylers: [
    //            { saturation: 0 },
    //            { lightness: 100 }
    //        ]
    //    },
    //    {
    //        featureType: "all",
    //        elementType: "all",
    //        stylers: [
    //            { saturation: -100 }
    //        ]
    //    }
    //], {
    //    name: "white"
    //});
    //
    //
    //tm = TimeMap.init({
    //    mapId: "map",               // Id of map div element (required)
    //    timelineId: "timeLine",     // Id of timeline div element (required)
    //    options: {
    //        eventIconPath: "../timemap/images/"
    //    },
    //    datasets: [
    //        {
    //            id: "artists",
    //            title: "Artists",
    //            theme: "orange",
    //            // note that the lines below are now the preferred syntax
    //            type: "basic",
    //            options: {
    //                items: [
    //                    {
    //                        "start" : "1449",
    //                        "end" : "1494-01-11",
    //                        "point" : {
    //                            "lat" : 43.7717,
    //                            "lon" : 11.2536
    //                        },
    //                        "title" : "Domenico Ghirlandaio",
    //                        "options" : {
    //                            // set the full HTML for the info window
    //                            "infoHtml": "<div class='custominfostyle'><b>Domenico Ghirlandaio</b> was a visual artist of some sort.</div>"
    //                        }
    //                    },
    //                    {
    //                        "start" : "1452",
    //                        "end" : "1519",
    //                        "point" : {
    //                            "lat" : 43.8166666667,
    //                            "lon" : 10.7666666667
    //                        },
    //                        "title" : "Leonardo da Vinci",
    //                        "options" : {
    //                            // load HTML from another file via AJAX
    //                            // Note that this may break in IE if you're running it with
    //                            // a local file, due to cross-site scripting restrictions
    //                            "infoUrl": "ajax_content.html",
    //                            "theme": "red"
    //                        }
    //                    },
    //                    {
    //                        "start" : "1475",
    //                        "end" : "1564",
    //                        "point" : {
    //                            "lat" : 43.6433,
    //                            "lon" : 11.9875
    //                        },
    //                        "title" : "Michelangelo",
    //                        "options" : {
    //                            // use the default title/description info window
    //                            "description": "Renaissance Man",
    //                            "theme": "yellow"
    //                        }
    //                    }
    //                ]
    //            }
    //        }
    //    ],
    //    bandIntervals: [
    //        Timeline.DateTime.DECADE,
    //        Timeline.DateTime.CENTURY
    //    ]
    //});
    //
    //var gmap = tm.getNativeMap();
    //gmap.mapTypes.set("white", styledMapType);
    //gmap.setMapTypeId("white");
}