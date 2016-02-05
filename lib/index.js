/**
 * Created by shaoh on 2/3/2016.
 */
var map;

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
}