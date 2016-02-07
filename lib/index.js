/**
 * Created by shaoh on 2/3/2016.
 */
var map;
var timeLine;
var eventJson;
var lastHighLightEvent

var availableColor = [
    'red',
    'orange',
    'green',
    'blue',
    'purple'
];

/**
 * Trigger this function on page is loaded
 */
function loadPage(){
    SimileAjax.History.enabled = false;
    map = L.map('map').setView([0, -20], 2);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        minZoom: 2,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiaHVzaGFvIiwiYSI6ImNpazd3YnYweTAwZmt1cWtubnlnbTRwaWUifQ.uU_WfyoPGEIIvEQ_retWeg'
    }).addTo(map);
    $(map.zoomControl.getContainer()).css({top:"0px"})

    var eventSource = new Timeline.DefaultEventSource();
    var startDate = "Jul 1 2007 00:00:00 GMT";
    var bandInfos = [
        Timeline.createBandInfo({
            overview: true,
            eventSource:    eventSource,
            date:           startDate,
            width:          "30%",
            intervalUnit:   Timeline.DateTime.YEAR,
            intervalPixels: 200
        }),
        Timeline.createBandInfo({
            eventSource:    eventSource,
            width:          "70%",
            date:           startDate,
            intervalUnit:   Timeline.DateTime.MONTH,
            intervalPixels: 100
        })
    ];
    bandInfos[0].syncWith = 1;
    bandInfos[0].highlight = true;
    timeLine = Timeline.create(document.getElementById("timeLine"), bandInfos);
    Timeline.OriginalEventPainter.prototype._showBubble = function(x, y, evt) {
        var id = evt.getID();
        for(var i=0; i<eventJson.length; i++){
            if(eventJson[i].id == id){
                highLightEvent_map(eventJson[i], false);
            }
        }
    }
    var topBand = timeLine.getBand(0);

    topBand.addOnScrollListener( function() {
        onTimeBarScrolled();
    });

    // load and prepare the data here
    $.ajax({
        url:"./data/life.json"
    }).done(function (data) {
        data.forEach(function (event) {
            //  required file format:
            //  http://simile-widgets.org/wiki/Timeline_EventSources
            //  file converter from csv to original file:
            //  https://shancarter.github.io/mr-data-converter/
            var times = ["start", "end"]
            times.forEach(function (timeName) {
                if(!isValueNullOrUndefinedOrEmpty(event[timeName])){
                    //event[timeName] = (new Date(event[timeName])).toUTCString();
                    event[timeName] = new Date(event[timeName]);
                }else{
                    delete event[timeName];
                }
            });

            if(event["durationEvent"].trim().toLowerCase()=="true"){
                event["durationEvent"] = true;
            }else{
                event["durationEvent"] = false;
            }

            var attributes = [
                "icon",
                "link",
                "color",
                "textColor",
                "classname",
                "latestStart",
                "earliestEnd"];
            attributes.forEach(function (attributeName) {
                if(isValueNullOrUndefinedOrEmpty(event[attributeName])){
                    delete event[attributeName];
                }
            });

            //allocate the icon url according to the color
            if(!isValueNullOrUndefinedOrEmpty(event["color"])){
                var iconUrl = null;
                switch (event["color"].trim().toLowerCase()){
                    case "red":{
                        iconUrl = "./img/red-circle.png";
                        break;
                    }
                    case "blue":{
                        iconUrl = "./img/blue-circle.png";
                        break;
                    }
                    case "green":{
                        iconUrl = "./img/green-circle.png";
                        break;
                    }
                    case "orange":{
                        iconUrl = "./img/orange-circle.png";
                        break;
                    }
                    case "purple":{
                        iconUrl = "./img/purple-circle.png";
                        break;
                    }
                    default:{
                        break;
                    }
                }
                if(!isValueNullOrUndefinedOrEmpty(iconUrl)){
                    event["icon"] = iconUrl;
                }
            }
            // rearrange the locations
            if(!isValueNullOrUndefinedOrEmpty(event["location"])){
                var values = event["location"].split(",");
                var pointList = [];
                for(var i=1; i<values.length; i+=2){
                    var x = values[i].trim();
                    var y = values[i-1].trim();
                    if(isValueNullOrUndefinedOrEmpty(x)){
                        continue;
                    }
                    pointList.push({
                        lon: parseFloat(x),
                        lat: parseFloat(y)
                    });
                }
                event["location"] = pointList;
                generateMarkerForEvent(event, false);
            }

           event["id"] = event["id"].toString();
        });
        eventJson = data;

        var timeline_data = {
            'dateTimeFormat': 'Gregorian',
            "events": data
        }

        var url = '.'; // The base url for image, icon and background image
        // references in the data
        eventSource.loadJSON(timeline_data, url); // The data was stored into the
                                                   // timeline_data variable.
        timeLine.layout(); // display the Timeline

    });
    $("#cardContainer").mCustomScrollbar({
        theme: "rounded-dots-dark"
    });
}

function onPageResize(){
    window.setTimeout(function() {
        timeLine.layout();
    }, 500);
}

function isValueNullOrUndefinedOrEmpty(value){
    if(value==null
        || value==undefined
        || value==""){
        return true;
    }else {
        return false;
    }
}

/**
 * when user scroll the time bar, this function will be triggered
 */
function onTimeBarScrolled(){
    var timeStart = timeLine.getBand(1).getMinVisibleDate();
    var timeEnd = timeLine.getBand(1).getMaxVisibleDate();
    var selectedEvents = selectEventsByTimeRange(timeStart, timeEnd);
    eventJson.forEach(function (event) {
        var marker = event.marker;
        if(isValueNullOrUndefinedOrEmpty(marker)){
            return;
        }
        if($.inArray(event, selectedEvents)>=0){
            if(!map.hasLayer(marker)){
                map.addLayer(marker);
            }
        }else{
            if(map.hasLayer(marker)){
                map.removeLayer(marker);
            }
        }
    });
    setOptimizedBoundsForEvents(selectedEvents);
}

/**
 * set the optimized map boundary according to selected point's locations
 * @param selectedEvents
 */
function setOptimizedBoundsForEvents(selectedEvents){
    var extendPercentage = 0.15;
    var singlePointZoomLevel = 4;
    var pointList = [];
    selectedEvents.forEach(function (event) {
        if(!isValueNullOrUndefinedOrEmpty(event.location)){
            event.location.forEach(function(point){
                pointList.push(point);
            });
        }
    });
    if(pointList.length==0){
        return;
    }else if(pointList.length==1){
        map.setView(pointList[0], singlePointZoomLevel);
    }else{
        var extent;
        for(var i=0; i<pointList.length; i++){
            var point = pointList[i];
            if(i==0){
                extent = [point.lat, point.lon, point.lat, point.lon];
            }
            if(point.lat>extent[2]){
                extent[2] = point.lat;
            }
            if(point.lat<extent[0]){
                extent[0] = point.lat;
            }
            if(point.lon>extent[3]){
                extent[3] = point.lon;
            }
            if(point.lon<extent[1]){
                extent[1] = point.lon;
            }
        }
        var range = Math.max(extent[3]-extent[1], extent[2]-extent[0])*extendPercentage;
        map.fitBounds ([
            [
                extent[0]-range,
                extent[1]-range,
            ],
            [
                extent[2]+range,
                extent[3]+range,
            ]])
    }
}

/**
 * select intersected events be time range
 * @param timeStart
 * @param timeEnd
 * @returns {Array}
 */
function selectEventsByTimeRange(timeStart, timeEnd){
    var selectedEvents = [];
    eventJson.forEach(function (event) {
        if(event.start>timeStart
            &&event.start<timeEnd){
            selectedEvents.push(event);
            return;
        }

        if(event.durationEvent){
            if(event.end>timeStart
                &&event.end<timeEnd){
                selectedEvents.push(event);
                return;
            }
            if(event.start<timeStart
                &&event.end>timeEnd){
                selectedEvents.push(event);
                return;
            }
        }
    });
    return selectedEvents;
}

/**
 * create markers which can be used for leaflet map according to the locations of event.
 * @param event
 * @param isWithHighLightAnimation
 * @reference
 * map.latLngToContainerPoint([34.263673, 108.185418]);
 * http://www.hongkiat.com/blog/scalable-vector-graphics-animation/
 * http://demo.hongkiat.com/scalable-vector-graphics-animation/index.html#multiple
 */
function generateMarkerForEvent(event, isWithHighLightAnimation){
    var color = event["color"];
    var pointList = event["location"];
    if(isValueNullOrUndefinedOrEmpty(pointList)){
        event["marker"] = null;
    }
    if(isValueNullOrUndefinedOrEmpty(color)){
        color = "blue";
    }


    if(pointList.length==0){
        event["marker"] = null;
    }else{
        var markers = [];
        for(var i=0; i<pointList.length; i++){
            if(isWithHighLightAnimation) {
                var iconHTMLString =
                    "<svg style='height: 60px; width: 60px'>" +
                    "<circle r='30' cx='30' cy='30' fill='transparent' fill-opacity='0.3' stroke='transparent' stroke-width='0'>" +
                    "<animate attributeName='r' from='0' to='30' dur='1s'/>" +
                    "<animate attributeName='stroke-width' from='4' to='0' dur='1s'/>" +
                    "<animate attributeName='fill' from='@@color' to='transparent' dur='1s'/>" +
                    "<animate attributeName='stroke' from='@@color' to='transparent' dur='1s'/>" +
                    "</circle>" +
                    "</svg>";
                var hightLightIcon = L.divIcon({
                    className: 'animatePointDiv',
                    html: iconHTMLString.replace(/@@color/g, color),
                    iconAnchor: [30, 30]
                });

                markers.push(L.marker(pointList[i],
                    {icon: hightLightIcon}));

            }

            markers.push(L.marker(pointList[i],
                {
                    icon: L.AwesomeMarkers.icon({
                        icon: 'star',
                        prefix: 'fa',
                        markerColor: color,
                        iconColor: 'white'
                    })
                }));

            if(i>0){
                if(isWithHighLightAnimation){
                    markers.push(L.polyline([pointList[i-1],pointList[i]], {dashArray: "3 10", className:"animateLineColor_"+color}));
                }else{
                    markers.push(L.polyline([pointList[i-1],pointList[i]], {color:color, dashArray: "3 10"}));
                }
            }
        }
        var group = L.featureGroup(markers);
        group.on("click", function(){
            highLightEvent_map(event, false);
        });
        event["marker"] = group;
    }
}

/**
 * generate the information card for a event
 * @param event
 */
function generateInfoCardForEvent(event){

}

/**
 * highlight/emphasize the elements on map by using color and animation
 * @param event
 * @param updateViewWithPreviousHightLightEvent if true, previous highlighted event will be used for controlling the map view extent
 */
function highLightEvent_map(event, updateViewWithPreviousHightLightEvent){
    if(!isValueNullOrUndefinedOrEmpty(lastHighLightEvent)&&lastHighLightEvent!=event){
        map.removeLayer(lastHighLightEvent.marker);
        generateMarkerForEvent(lastHighLightEvent, false);
        map.addLayer(lastHighLightEvent.marker);
    }

    map.removeLayer(event.marker);
    generateMarkerForEvent(event, true);
    map.addLayer(event.marker);
    lastHighLightEvent = event;
}