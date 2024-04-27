//Instantiate map
let map = L.map('map', {
    gestureHandling: activateGestureHandling(),
    contextmenu: true,
    contextmenuWidth: 150,
    contextmenuItems: [{
        text: 'Open with OSM',
        icon: 'img/osm-logo.png',
        callback: openOSM
    },
    {
        text: 'Open with GMaps',
        icon: 'img/gmaps-logo.png',
        callback: openGmaps
    }]
});

//Either keep hash value in URL (prio 1) or set location.hash with coords from local storage (prio 2).
//If no entry in local storage: Zoom all the way out to "#2/15/-15" (prio 3)
//The map view itself is set within leaflet-hash afterwards ("map.setView")
const hashFromLocalStorage = localStorage.getItem('location-hash');
if (!location.hash) location.hash = hashFromLocalStorage || "#2/15/-15";

//Activate gesture handling only on small screens ("use two fingers to pan and zoom map")
function activateGestureHandling() {
    if (screen.width < 601) return true;
    else return false;
}

//If screen width changes during use of app (e.g. turning phone from portrait to landscape)
//--> Activate gesture handling if screen width is < 601px
window.addEventListener("resize", () => {
    // console.log(screen.width);
    if (screen.width < 601) map.gestureHandling.enable();
    else map.gestureHandling.disable();
});

//Add scale
L.control.scale().addTo(map);

//Add "set current location" button to map
L.control.locate({
    initialZoomLevel: 14,
    strings: {
        title: "Show changes around my current location"
    }
}).addTo(map);

//Toggle sidebar button on map
let sidebar = document.querySelector(".changesets");
L.Control.toggleSidebarButton = L.Control.extend(
    {
        options:
        {
            position: 'topleft',
        },
        onAdd: function (map) {
            let controlDiv = L.DomUtil.create('div', 'leaflet-control-toggle leaflet-bar');
            L.DomEvent
                .addListener(controlDiv, 'click', L.DomEvent.stopPropagation)
                .addListener(controlDiv, 'click', L.DomEvent.preventDefault)
                .addListener(controlDiv, 'click', toggleSidebar);

            let controlUI = L.DomUtil.create('a', 'leaflet-bar-part leaflet-bar-part-single', controlDiv);
            controlUI.title = 'Toggle display of sidebar <Spacebar>';
            controlUI.href = '#';

            let barIcon = L.DomUtil.create('span', 'leaflet-control-toggle-icon', controlUI);

            return controlDiv;
        }
    });
let toggleSidebarButton = new L.Control.toggleSidebarButton();
map.addControl(toggleSidebarButton);

/*Toggle sidebar class and update Leaflet map size
(but quite useless because the download button is hidden anyway, thus cannot make use of the added map real estate to download changesets of a larger region)*/
function toggleSidebar() {
    sidebar.classList.toggle("hide");
    // let size = map.getSize();
    // console.log(size);
    // let bounds = map.getBounds();
    // console.log(bounds);
    map.invalidateSize();//make sure that leaflet updates map size
    // size = map.getSize();
    // console.log(size);
    // bounds = map.getBounds();
    // console.log(bounds);
}

//1. Toggle display of sidebar on press of Spacebar
//2. On typing a letter or number: Focus on filter changeset input field and input first letter
document.addEventListener("keyup", event => {
    // console.log(event.key);
    const isLetter = (event.key >= 'a' && event.key <= 'z');
    const isNumber = (event.key >= '0' && event.key <= '9');
    event.preventDefault(); //prevent default, i.e. "page down" for spacebar
    if (event.key == " ") {
        toggleSidebar();
    } else if (isLetter || isNumber) {
        let inputField = document.querySelector(".search-changesets-field");
        //If the input field is empty AND doesn't have focus: Add focus, write typed letter in field and launch filter function.
        if (!inputField.value && document.activeElement !== inputField) {
            inputField.focus();
            inputField.value = event.key;
            showHideCrossThenFilter();
        }
    }
});

//Open link to OSM when "RMB --> Open with..."
function openOSM(e) {
    const url = `https://www.openstreetmap.org/?mlat=${e.latlng.lat}&mlon=${e.latlng.lng}#map=${map.getZoom()}/${e.latlng.lat}/${e.latlng.lng}`;
    window.open(url, '_blank').focus();
}

//Open link to Google Maps when "RMB --> Open with..."
function openGmaps(e) {
    const url = `https://maps.google.com/maps?q=loc:${e.latlng.lat},${e.latlng.lng}`;
    window.open(url, '_blank').focus();
}

//Timeframe
let daysToShow;
// load resolutionFromLocalStorage from local storage, if available
const resolutionFromLocalStorage = localStorage.getItem("resolution");
if (resolutionFromLocalStorage) {
    daysToShow = resolutionFromLocalStorage;
    // select value from local storage in drop down menu
    document.getElementById('resolution').value = daysToShow;
} else {
    // else, i.e. no resolution saved in local storage: Default to 7 days
    daysToShow = 7;
}

//Calculate point in time from where to start analysis
function calculateAnalysisStartTime() {
    const analysisStartTime = (new Date(new Date() - 1000 * 60 * 60 * 24 * daysToShow)).toISOString();
    // console.log(analysisStartTime);
    return analysisStartTime;
}

//Update hash on map pan/zoom (functionality from leaflet-hash.js)
map.addHash();

//Map attribution
map.attributionControl.setPrefix('');
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: "<a target='_blank' href='https://www.openstreetmap.org/copyright' style='background:url(data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABoAAAAaCAMAAACelLz8AAAB11BMVEXZ2dlkZGT///////////8mJibIyMj5+fm6urr///8sLCywsLBJSUn///9eXl7////////j4+P////////Q0ND////u7u7i4uIfHx/s7OxmZmZzc3P39/fw8PDg4OD5+fmNjY1cXFz5+flQUFBGRkaIiIhtbW3///////9hYWHS0tKlpaWsrKzZ2dmgoKCpqalycnLg4OCCgoJLS0tEREQlJSX9/f3///8/Pz/e3t4jIyP///////////+/v7+Ghobp6enDw8Pl5eVXV1f////////U1NT////////////////l5eW1tbX///+4uLj////////////////////////////w8PDNzc3GxsYuLi7w8PD///////9paWmvr6/c3NwhISHe3t5UVFQfHx/y8vLn5+d3d3eXl5f////09PTs7Oz///8zMzN8fHz///+UlJT////////u7u44ODj////p6en///86Ojqurq5ZWVlfX1////////8hISFBQUGioqIlJSXV1dV6enoqKioxMTH39/eLi4s4ODj///9ra2ubm5v9/f3Nzc28vLz///9LS0v///////////+FhYUdHR3////X19cjIyM2Njaenp7///8AAAAbGxtl93oXAAAAnXRSTlNzcE9udnpweG9Gem50TnI9Z3VgbHEWeHR9dnBvendzfG5ye3N0b3A4I3Fxbm5ybm5wdG5zdXt0NHVze14eMW9udW90cld4cUdSFx11bnJvHG1ANj8VQnlwcHl4H1xwb3N8dHN8eXZvbnV5d0t4byluAyd3dwt2VnZucnEvCn11bnxyb3p4e252BHBufXFvYnRzZQxvfWpyfHdufQB9fOn/1AAAAY5JREFUKM+V0mVvwzAQBuCMmZmZmZmZmZmZGcpMa7ukWXK5H7ukVbOpmqbt/WDZfiRLdz6C+8oqAPh6+8BqnANaOI74RoASydLisnzRdiGt9yQa9pVglC7LYws8advLTxEWoJaGx1x6ksx/LdQetI5R55xIE4O2+yvhwZDgwxUaobDh1kn6F/ud9vSMBu3p5lLgycqGAZosjneCe52zLTyjEB17DRAdERkva0Rk34h3x+gNinmy7FqyKOcWiDcWfw4QgL+TXC2sH8yOJ9V1AXRaUZmdkZqCALX4APDhotKjbcZ8LDkyoiyBp3I0ipRWgVgDORu768mJCFt3uEe4SXPA1wRFqgPatEVBJpyZSDcpFBR2mKzFubgGN5BfpjEb3GTVdJtNRqrq+DE9aQcMJFSKhIyW7UFsri7JUyHJqMhNhqT+UPL/iO+8ix4e5y1P38A6zv+X0Pln89jU7LT9mtU575mLkcmZV47/r/Y9+4temIKhARutVO/3H54Mc87ZuG1rFQfn8uq+r/dc7zp8AmmAXy4xp9xiAAAAAElFTkSuQmCC) no-repeat; background-size:26px 26px;width:24px;height:24px;display:block;z-index:1000;bottom:2px;right:5px;bottom:5px;position:absolute;'></a>"
}).addTo(map);

//Update map display on zoom and page load
function updateMap() {
    const mapHtml = document.querySelector("#map");
    const currentZoomLevel = map.getZoom();
    const button = document.getElementById('download-changesets-button');
    const infoText = document.getElementById("zoom-in");
    localStorage.setItem('location-hash', location.hash);
    if (currentZoomLevel > 11) {
        // console.log("Zoom level > 11");
        mapHtml.classList.remove("faded");
        infoText.classList.add("hide");
        button.disabled = "";
        button.title = "Download recent changesets in this region";
        return true;
    } else {
        // console.log("Zoom level <= 11");
        mapHtml.classList.add("faded");
        infoText.classList.remove("hide");
        button.disabled = "disabled";
        button.title = "Zoom in to download changes";
        return false;
    }
}

//Return color depending on age of changeset. New: bright red, old: dark red/gray
function defineColor(date) {
    /*The datescale function expects a date that is between Now and 1 (or 3, 7, 30) days in the past.
    Depending on how close the date is to Now it returns a number closer to 1.
    Example: NOW is 2022-11-14, 14:30. The range is 7 days)
    const number = datescale(new Date(2022,10,13) //number = 0.7705556*/
    const datescale = d3.time.scale()
        .domain([new Date(calculateAnalysisStartTime()), new Date()])
        .range([0, 1]);
    /*The colint function interpolates between gray (value 0) and red (value 1)
    colint(0) equals gray (#777777)
    colint(1) equals red (#ff0000)*/
    const colint = d3.interpolateRgb('#777', '#f00');
    return colint(datescale(date))
}

//Toggle display of loading animation and appearance of download button
function toggleWaitingScreen() {
    const loadingAnimation = document.querySelector("#loading-animation");
    const button = document.getElementById('download-changesets-button');
    const buttonText = document.getElementById('download-changesets-button-text');

    loadingAnimation.classList.toggle("hide");//display loading spinner
    buttonText.innerText = (buttonText.innerText == "Get Changesets") ? "Loading..." : "Get Changesets";//Toggle button text
    button.disabled = (button.disabled) ? button.disabled = "" : button.disabled = "disabled";//Toggle button disable
}

//On page load: Check if map is zoomed in enough. If yes: Download OSM changeset data from overpass via XHR request
const overpass_server = '//overpass-api.de/api/'; //'https://overpass.kumi.systems/api/';
const vandalismThreshold = -3; //If 3 more elements or tags have been deleted than added, the traffic light will change to red
let xhr;
let leafletGeoJsonObject = null; //All the GeoJSON data will go into this variable
const debugMode = false; //False (default): Do an API call to Overpass. True: Use locally saved xml files for debugging purposes

//Check if map is zoomed in enough
const isMapZoomedInEnough = updateMap();
if (isMapZoomedInEnough) run();

//Variable with infos for all downloaded changeset
let changesets = {};

//Start download of changeset data and initiate rendering of changesets list and GeoJSON data on map
function run() {
    d3.select('#map').classed('faded', true);//Map displayed greyish (Cannot go into "toggleWaitingScreen()" because we want to keep the map greyed out in case of unsuccessful overpass query)
    document.querySelector(".filter-container").classList.add("hide");//Hide filter changesets toolbar until load of changesets has been completed successfully
    toggleWaitingScreen();
    if (xhr) xhr.abort();
    const bounds = map.getBounds();
    const bbox = bounds.getSouthWest().lat + ',' +
        bounds.getSouthWest().wrap().lng + ',' +
        bounds.getNorthEast().lat + ',' +
        bounds.getNorthEast().wrap().lng;
    // const overpass_query = '[adiff:"' + calculateAnalysisStartTime() + '"][bbox:' + bbox + '][out:xml][timeout:22];way->.ways;(.ways>;node;);out meta;.ways out geom meta;';//This query sometimes only returned nodes. Thus replaced with query below
    const overpass_query = '[adiff:"' + calculateAnalysisStartTime() + '"][bbox:' + bbox + '][out:xml];nw;out geom meta;';
    // console.log(overpass_server + 'interpreter?data=' + overpass_query);

    //Either do an API call to Overpass or use a locally saved xml file for debugging purposes
    let xmlDataLocation;
    if (debugMode) xmlDataLocation = "./examples/exampleOverpassAPI.xml"; //Load example xml for debugging purposes. Works offline
    else xmlDataLocation = overpass_server + 'interpreter?data=' + overpass_query; //API call to overpass

    xhr = d3.xml(xmlDataLocation
    ).on("error", function (error) {
        toggleWaitingScreen();
        message("alarm", "Server error: " + error.statusText); //Error message in case of no results from Overpass
    })
        .on('load', function (data) {
            // console.log(data);
            let newData = document.implementation.createDocument(null, 'osm');
            let oldData = document.implementation.createDocument(null, 'osm');
            const elements = data.querySelectorAll('action');
            //Separate changed (new) and pre-change (old) OSM map data into respective xml objects
            // console.log(elements);
            for (let i = 0; i < elements.length; i++) {
                const element = elements[i];
                // console.log(element);
                switch (element.getAttribute('type')) {
                    case 'create':
                        newData.documentElement.appendChild(element.querySelector("*").cloneNode(true));//cloneNode needed to keep "data" unchanged
                        break;
                    case 'modify':
                    case 'delete':
                        var newElement = element.querySelector('new > *').cloneNode(true);//cloneNode needed to keep "data" unchanged
                        var oldElement = element.querySelector('old > *').cloneNode(true);
                        // fake changeset id on new data
                        var newestTs = +new Date(newElement.getAttribute("timestamp"));
                        if (newElement.tagName == 'way') {
                            // inherit meta data from newest child node
                            var nodes = newElement.getElementsByTagName('nd');
                            for (var j = 0; j < nodes.length; j++) {
                                var nodeId = nodes[j].getAttribute('ref');
                                var node = newData.querySelector('node[id="' + nodeId + '"]');
                                if (node === null) continue;
                                var nodeTs = +new Date(node.getAttribute("timestamp"));
                                if (nodeTs > newestTs) {
                                    newElement.setAttribute('changeset', node.getAttribute('changeset'));
                                    newElement.setAttribute('user', node.getAttribute('user'));
                                    newElement.setAttribute('uid', node.getAttribute('uid'));
                                    newElement.setAttribute('timestamp', node.getAttribute('timestamp'));
                                }
                            }
                        }
                        // fake changeset id on old data
                        oldElement.setAttribute('changeset', newElement.getAttribute('changeset'));
                        oldElement.setAttribute('user', newElement.getAttribute('user'));
                        oldElement.setAttribute('uid', newElement.getAttribute('uid'));
                        oldElement.setAttribute('timestamp', newElement.getAttribute('timestamp'));
                        if (element.getAttribute('type') == 'modify')
                            newData.documentElement.appendChild(newElement);
                        oldData.documentElement.appendChild(oldElement);
                }
            }

            const newGeojson = osmtogeojson.toGeojson(newData);
            const oldGeojson = osmtogeojson.toGeojson(oldData);
            oldGeojson.features.forEach(function (feature) {
                feature.properties.__is_old__ = true;
            });

            //Change app display from "loading" to "ready"
            d3.select('#map').classed('faded', false);
            toggleWaitingScreen();

            //Display filter changesets toolbar
            document.querySelector(".filter-container").classList.remove("hide");
            //Remove content of "filter changeset input" and hide X (in case old text from a previous download is still there)
            document.querySelector(".search-changesets-field").value = "";
            document.querySelector(".delete-filter-input").classList.add("hide");
            //Reset display of "filter-red-checkbox" (in case it has been checked on a previous download)
            document.querySelector(".traffic-light-filter").classList.add("filter-red-color");
            document.querySelector("#filter-red-checkbox").checked = false;

            //Clear old GeoJSON data from map
            leafletGeoJsonObject && map.removeLayer(leafletGeoJsonObject);

            //Create new GeoJSON layer, fill it with features of downloaded OSM data and add it to the map
            leafletGeoJsonObject = new L.GeoJSON({
                type: 'FeatureCollection',
                features: [].concat(oldGeojson.features).concat(newGeojson.features)
            }, {
                style: setStyle,
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, { radius: 8 });
                },
                onEachFeature: onEachFeature
            }).addTo(map);

            function setStyle(f) {
                return {
                    color: defineColor(new Date(f.properties.meta.timestamp)),
                    opacity: f.properties.__is_old__ === true ? 0.2 : 1,
                    weight: 3
                }
            };

            //Define what happens when hovering over each polygon/way/marker
            function onEachFeature(feature, layer) {
                // console.log(feature);
                // console.log(layer);

                //Increase line weight when feature gets focus
                layer.on('mouseover', function (e) {
                    // console.log(layer);
                    layer.setStyle({ weight: 6 }); //increase line weight of hovered layer
                    //Now we check if the hovered element got modified (i.e. not deleted nor created).
                    //Write both XML nodes of old and new element into variable "xmlElements"
                    const xmlElements = data.querySelectorAll('[id="' + layer.feature.properties.id + '"]');
                    // console.log(xmlElements);
                    const action = xmlElements[0].parentNode.parentNode.getAttribute('type');
                    // console.log(action);
                    //Check if action is 'modify'. If yes: Highlight non-hovered twin element of nodes, lines and polygons as well. Skip unmoved elements.
                    if (action === 'modify') {
                        // console.log('Modify! Highlight non-hovered twin element as well (i.e. old or new version). If the element is a node: Only highlight twin element if node has been moved');
                        const idOfHoveredElement = layer.feature.properties.id;//OSM element ID
                        const leafletIdOfHoveredElement = leafletGeoJsonObject.getLayerId(layer);//Internal Leaflet layer ID
                        //console.log('idofhoveredelement: ' + idOfHoveredElement + ' leafletIdOfHoveredElement: ' + leafletIdOfHoveredElement);

                        //First check if element is a node. If it is: Check if coordinates have changed. If yes: Highlight twin node. If no: stop function execution (no need to traverse layer object and waste resources)
                        if (xmlElements[0].tagName === "node") {
                            // console.log('This is a NODE! Now check if the node has been moved');
                            const latEl0 = xmlElements[0].getAttribute('lat');
                            const latEl1 = xmlElements[1].getAttribute('lat');
                            const lonEl0 = xmlElements[0].getAttribute('lon');
                            const lonEl1 = xmlElements[1].getAttribute('lon');
                            if (latEl0 !== latEl1 || lonEl0 !== lonEl1) {
                                // console.log('Coordinates of old and new node are NOT identical --> node has been moved! Highlight twin element.');
                                const leafletLayerOfTwin = findLeafletLayerOfTwin(idOfHoveredElement, leafletIdOfHoveredElement);
                                // console.log('leafletLayerOfTwin: ' + leafletLayerOfTwin);
                                if (!leafletLayerOfTwin) {
                                    // console.log('Twin element is not available. This usually means that 1. The node is part of way 2. The old version of the node had no tags. "osmtogeojson" will NOT convert those nodes into GeoJSON');
                                    return;
                                }
                                highlightTwinElementLocation(layer, leafletLayerOfTwin);
                            }
                        }
                        //All other elements (i.e. lines and polygons): Highlight twin element if the geometry has been changed.
                        //A way to check if a line or polygon has been changed is to compare the length of new and old element.
                        //If there is a difference the element has been changed. Solution below is from https://github.com/tyrasd/geojson-length.
                        //This can be computationally demanding on complex LineStrings and polgyons. Thus simply highlight all
                        //twin elements - regardless of whether the geometry has been changed or not - if node count is greater than 50.
                        else if (xmlElements[0].tagName === "way") {
                            // console.log(layer);

                            const leafletLayerOfTwin = findLeafletLayerOfTwin(idOfHoveredElement, leafletIdOfHoveredElement);
                            // console.log('leafletLayerOfTwin: ' + leafletLayerOfTwin);

                            //Check if node count of line/polygon is greater than 50. if yes just highlight twin without measuring
                            const nNodes = xmlElements[0].getElementsByTagName('nd').length;
                            // console.log(nNodes);
                            if (nNodes > 50) {
                                // console.log('Node count is large (>50). So skip the length comparison and highlight twin geometry no matter if there is a length difference or not.');
                                highlightTwinElementLocation(layer, leafletLayerOfTwin);
                                return;
                            };

                            //Get length of hovered element
                            const lengthOfHoveredElement = calculateLengthOfLineOrPolygon(layer.feature.geometry);
                            // console.log('lengthOfHoveredElement: ' + lengthOfHoveredElement);

                            //Get length of twin element
                            const lengthOfTwinElement = calculateLengthOfLineOrPolygon(leafletLayerOfTwin.feature.geometry);
                            // console.log('lengthOfTwinElement: ' + lengthOfTwinElement);

                            //Compare the two. First round to full meters
                            // console.log('lengthOfHoveredElement (rounded): ' + +lengthOfHoveredElement.toFixed(1));

                            if (+lengthOfHoveredElement.toFixed(1) !== +lengthOfTwinElement.toFixed(1)) {
                                // console.log('The elements have different lengths, thus the geometry most probably got changed. Highlight the twin elemnt.');
                                highlightTwinElementLocation(layer, leafletLayerOfTwin);
                            }
                        }
                    }
                });

                //Change line weight back when feature loses focus
                layer.on('mouseout', function (e) {
                    // leafletGeoJsonObject.resetStyle();
                    layer.setStyle({ weight: 3 });
                });
            }

            //Find and return the Leaflet layer of the non-hovered twin element
            function findLeafletLayerOfTwin(idOfHoveredElement, leafletIdOfHoveredElement,) {
                let leafletLayerOfTwin;
                leafletGeoJsonObject.eachLayer(function (l) {
                    if (l.feature.properties.id === idOfHoveredElement && leafletGeoJsonObject.getLayerId(l) !== leafletIdOfHoveredElement) {
                        // console.log('leafletGeoJsonObject.getLayerId(l): ' + leafletGeoJsonObject.getLayerId(l));
                        const leafletIdOfTwin = leafletGeoJsonObject.getLayerId(l);
                        leafletLayerOfTwin = leafletGeoJsonObject.getLayer(leafletIdOfTwin);
                    }
                });
                return leafletLayerOfTwin;
            }

            //Calculate length of LineString or polygon. Needed to compare 2 LineStrings or polygons to see if they have different lengths
            function calculateLengthOfLineOrPolygon(geometry) {
                // console.log(geometry);
                if (geometry.type === 'LineString')
                    return calculateLength(geometry.coordinates);
                else if (geometry.type === 'MultiLineString' || geometry.type === 'Polygon')
                    return geometry.coordinates.reduce(function (memo, coordinates) {
                        return memo + calculateLength(coordinates);
                    }, 0);
                else
                    return null;

                function calculateLength(lineString) {
                    // console.log(lineString);
                    if (lineString.length < 2)
                        return 0;
                    var result = 0;
                    for (var i = 1; i < lineString.length; i++) {
                        // console.log(result);
                        result += distance(lineString[i - 1][0], lineString[i - 1][1],
                            lineString[i][0], lineString[i][1]);
                    }
                    return result;
                }

                /**
                 * Calculate the approximate distance between two coordinates (lat/lon)
                 *
                 * © Chris Veness, MIT-licensed,
                 * http://www.movable-type.co.uk/scripts/latlong.html#equirectangular
                 */
                function distance(λ1, φ1, λ2, φ2) {
                    const R = 6371000;
                    Δλ = (λ2 - λ1) * Math.PI / 180;
                    φ1 = φ1 * Math.PI / 180;
                    φ2 = φ2 * Math.PI / 180;
                    const x = Δλ * Math.cos((φ1 + φ2) / 2);
                    const y = (φ2 - φ1);
                    const d = Math.sqrt(x * x + y * y);
                    return R * d;
                };
            }

            //Highlight the non-hovered twin element (i.e. the new or old geometry) as well.
            function highlightTwinElementLocation(leafletLayerOfHoveredElement, leafletLayerOfTwin) {
                let count = 3;
                let direction = 1; // 1 for counting up, -1 for counting down

                //if it is blue: change back to blue on mouseout, else change back to shade of red
                const preHoverColor = leafletLayerOfTwin.options.color;
                //console.log('%c Pre-hover color: ' + preHoverColor + '', 'background: ' + preHoverColor + '; color: #000000');

                const interval = setInterval(function () {
                    if (count === 10) {
                        direction = -1; // Change direction to count down
                    } else if (count === 3) {
                        direction = 1; // Change direction to count up
                    }

                    count += direction; // Increment or decrement count based on direction

                    // Set the weight property dynamically
                    leafletLayerOfTwin.setStyle({
                        color: '#ff9900',//Highlight twin geometry in a bright orange
                        opacity: 1,
                        weight: count
                    });

                }, 100); // Change the interval duration (in milliseconds) as needed

                // Clear the interval when mouse is not hovering
                leafletLayerOfHoveredElement.once('mouseout', function () {
                    //'Once' is needed to remove the mouseout event listener after execution. Else multiple mouseout
                    //event listeners are created on each mouseover event. This would lead to the following situation:
                    //This mouseout function would be called multiple times on subsequent mouseouts,
                    //e.g. after 'mousevering' over the same element the 6th time this mouseout function is called 6 times instead of once.

                    // console.log('clearInterval called!');
                    clearInterval(interval);//stop oscillation of line weight
                    leafletGeoJsonObject.resetStyle(leafletLayerOfTwin);//reset style of oscillating geometry, i.e. line weight back to 3, opacity back to previous value and color back shade of red
                    //If this geometry belongs to highlighted changeset --> change it back to the highlighting color (i.e. blue)
                    if (preHoverColor === '#008dff') {
                        // console.log('%c The color is blue! ', 'background: ' + preHoverColor + '; color: #000000', 'So change color back to blue');
                        leafletLayerOfTwin.setStyle({
                            color: '#008dff',//Change color of twin geometry back to blue
                        });
                    }
                });
            }

            changesets = {};//Empty the changesets object in case of a subsequent run
            //here the leaflet layers and metadata is written into "changesets" object, which then goes to "bytime" array.
            leafletGeoJsonObject.eachLayer(function (l) {
                if (!l.feature.properties.meta.changeset) return;
                changesets[l.feature.properties.meta.changeset] = changesets[l.feature.properties.meta.changeset] || {
                    id: l.feature.properties.meta.changeset,
                    time: new Date(l.feature.properties.meta.timestamp),
                    user: l.feature.properties.meta.user,
                    comment: '',
                    deltaInNodesWays: 0,
                    deltaInTags: 0,
                    possibleVandalism: false,
                    osmEditor: '',
                    layers: []
                };
                changesets[l.feature.properties.meta.changeset].layers.push(l);
            });

            leafletGeoJsonObject.on('click', function (e) {
                //Highlight clicked layer on map and in sidebar
                click({ feature: e.layer });
                //Scroll selected element into view in sidebar
                //(Only on large screens. On small screens the map would scroll out of view, which is annoying)
                if (screen.width > 600) {
                    document.querySelector('.active').scrollIntoView({
                        behavior: 'smooth'
                    });
                }

                const tableHtml = createTable(e.layer.feature.properties.id)
                let mapContainer = document.querySelector(".map-container");

                //Popup with tag comparison table
                L.popup({
                    maxWidth: mapContainer.clientWidth - 45,
                    maxHeight: mapContainer.clientHeight - 40,
                    className: "stylePopup"
                })
                    .setLatLng(e.latlng)
                    .setContent(tableHtml)
                    .openOn(map);
            });

            //Create tag comparison table
            function createTable(id) {
                {
                    const node = data.querySelectorAll('[id="' + id + '"]');
                    //First check what type of action has been performed on the element (i.e. create, modify, delete)
                    let action = node[0].parentNode.parentNode.getAttribute('type');//Check if action is "modify", "delete" or "null"
                    if (!action) action = "create";//The xml data structure is different for "create" nodes, thus action will be "null" in the line above
                    // console.log(action);

                    //Create header with element info
                    let tableHtml = `<span class="${action} capitalize">${action}</span> ${node[0].nodeName} <a href="https://www.openstreetmap.org/${node[0].nodeName}/${node[0].getAttribute("id")}" target="_blank" rel="noopener noreferrer">${node[0].getAttribute("id")}</a> <a href="http://osmlab.github.io/osm-deep-history/#/${node[0].nodeName}/${node[0].getAttribute("id")}" title="Get complete history of element in 'OSM Deep History'" target="_blank" rel="noopener noreferrer"><svg class="clock-with-circular-arrow-symbol"><use href="img/icons.svg#clock-with-circular-arrow"></use></svg></a>`;

                    //Variables
                    tableHtml += `<table class="table-container">`;

                    //Object with all key-value pairs for new and old and relevant meta tags for table
                    const keyvalues = { old: { meta: {}, tags: {} }, new: { meta: {}, tags: {} } };

                    //1 CREATE
                    if (action === "create") {
                        //Copy meta tags
                        const keysNew = node[0].querySelectorAll("tag");

                        //Create table
                        tableHtml += `
                            <thead>
                                <tr>
                                    <th>Tag</th>
                                    <th>New</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr class="metatags">
                                    <td>version</td>
                                    <td>${node[0].getAttribute("version")}</td>
                                </tr>
                                <tr class="metatags">
                                    <td>timestamp</td>
                                    <td>${moment(node[0].getAttribute("timestamp")).fromNow()}</td>
                                </tr>
                                <tr class="metatags">
                                    <td>user</td>
                                    <td>${node[0].getAttribute("user")}</td>
                                </tr>
                        `;

                        for (let i = 0; i < keysNew.length; i++) {
                            tableHtml += `
                                <tr class="create">
                                    <td>${keysNew[i].getAttribute('k')}</td>
                                    <td>${keysNew[i].getAttribute('v')}</td>
                                </tr>
                                `
                        }
                    }

                    //2 MODIFY/DELETE
                    else {
                        //Create Set with all unique key-values from old and new
                        const uniqueKeysSet = new Set();
                        //Start with old
                        //Copy meta tags
                        keyvalues.old.meta["version"] = node[0].getAttribute("version");
                        keyvalues.old.meta["timestamp"] = moment(node[0].getAttribute("timestamp")).fromNow();
                        keyvalues.old.meta["user"] = node[0].getAttribute("user");
                        const keysOld = node[0].querySelectorAll("tag");
                        for (let i = 0; i < keysOld.length; i++) {
                            keyvalues.old.tags[keysOld[i].getAttribute('k')] = keysOld[i].getAttribute('v');
                            uniqueKeysSet.add(keysOld[i].getAttribute('k'));
                        }
                        //Continue with new
                        //Copy meta tags
                        keyvalues.new.meta["version"] = node[1].getAttribute("version");
                        keyvalues.new.meta["timestamp"] = moment(node[1].getAttribute("timestamp")).fromNow();
                        keyvalues.new.meta["user"] = node[1].getAttribute("user");
                        const keysNew = node[1].querySelectorAll("tag");
                        for (let i = 0; i < keysNew.length; i++) {
                            keyvalues.new.tags[keysNew[i].getAttribute('k')] = keysNew[i].getAttribute('v');
                            uniqueKeysSet.add(keysNew[i].getAttribute('k'));
                        }
                        // console.log(keyvalues);
                        //Create array in which all keys are ordered alphabetically
                        const uniqueKeysArr = Array.from(uniqueKeysSet).sort();
                        // console.log(uniqueKeysArr);

                        //Create table
                        tableHtml += `
                            <thead>
                                <tr>
                                    <th>Tag</th>
                                    <th>Old</th>
                                    <th>New</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr class="metatags">
                                    <td>version</td>
                                    <td>${keyvalues.old.meta["version"]}</td>
                                    <td>${keyvalues.new.meta["version"]}</td>
                                </tr>
                                <tr class="metatags">
                                    <td>timestamp</td>
                                    <td>${keyvalues.old.meta["timestamp"]}</td>
                                    <td>${keyvalues.new.meta["timestamp"]}</td>
                                </tr>
                                <tr class="metatags">
                                    <td><div>user</td>
                                    <td>${keyvalues.old.meta["user"]}</td>
                                    <td>${keyvalues.new.meta["user"]}</td>
                                </tr>
                            `;

                        //Traverse uniqueKeysArray and check in object which value this key has in new and old
                        for (let i = 0; i < uniqueKeysArr.length; i++) {
                            let oldTag = keyvalues.old.tags[uniqueKeysArr[i]];
                            let newTag = keyvalues.new.tags[uniqueKeysArr[i]];
                            let cssClass;
                            //Case 1: Tag deleted in new --> Background color red, change from "undefined" to ""
                            if (!newTag) {
                                cssClass = "delete";
                                newTag = "";
                            }
                            //Case 2: Tag created in new --> Background color create, change from "undefined" to ""
                            else if (!oldTag) {
                                cssClass = "create";
                                oldTag = "";
                            }
                            //Case 3: Tag different in new --> Background color yellow
                            else if (oldTag !== newTag) cssClass = "modify";

                            //Case 4: Tags similar --> Don't display this key-value pair
                            else cssClass = "'unchanged'";

                            tableHtml += `
                                <tr ${(cssClass ? 'class=' + cssClass : '')}>
                                    <td>${uniqueKeysArr[i]}</td>
                                    <td>${oldTag}</td>
                                    <td>${newTag}</td>
                                </tr>
                                `
                        }
                    }

                    tableHtml += `
                            </tbody>
                        </table>
                    `;

                    //Create link to edit geometry in iD editor (only if element has not been deleted - deleted elements cannot be edited)
                    if (action !== "delete") {
                        tableHtml += `<a href="https://www.openstreetmap.org/edit?${node[0].nodeName}=${node[0].getAttribute("id")}" target="_blank" rel="noopener noreferrer">Edit in iD</a>`;
                    }

                    return tableHtml;
                }
            }

            //Download changeset text and changeset comment count. Once done render changesets list on the left side
            //Write changeset id's in an array. This is used to create URL for API call
            const changesetIds = [];
            for (const key in changesets) {
                changesetIds.push(key);
            }
            // console.log(changesetIds);

            document.querySelector("#results").innerHTML = "";//Empty old results list (same happens in renderChangeSetsList() "allresults" later on, but because of the API call below the old list in a subsequent call would still be shown for a second while the new GeoJSON data has already been loaded --> confusing UX)

            const queue = d3.queue();

            //Load a local example file if debug mode is on. If not call the OSM API.
            if (debugMode) queue.defer(d3.xml, "./examples/exampleOSMAPI.xml");//load local file
            else {
                //Fetch data from OSM database. If there are more than 100 changesets to query make multiple API requests with a hundred CS each.
                while (changesetIds.length > 0) {
                    // console.log('executed');
                    queue.defer(d3.xml, 'https://api.openstreetmap.org/api/0.6/changesets?changesets=' + changesetIds.splice(0, 100).join(','));//limit queried changesets to 100
                }
            }

            queue.awaitAll(function (error, xmls) {
                if (error) return console.error(error);
                // console.log(xmls);
                xmls.forEach(function (xml) {
                    const css = xml.getElementsByTagName('changeset');
                    // console.log(css);
                    for (let i = 0; i < css.length; i++) {
                        const cid = css[i].getAttribute('id');
                        //Write discussion count to changesets object
                        changesets[cid].discussionCount = +css[i].getAttribute("comments_count");
                        //Write changeset comment to changesets object
                        const commentTag = css[i].querySelector('tag[k="comment"]');
                        if (commentTag)
                            changesets[cid].comment = commentTag.getAttribute('v');

                        //Get sum of warnings and resolved iD warnings for each changeset and write the delta into changesets object
                        // console.log(css[i]);
                        const tagsWithResolvedIdWarnings = css[i].querySelectorAll('tag[k^="resolved"]');
                        const nIdResolvedWarnings = getSumOfiDWarningsAndResolvedWarnings(tagsWithResolvedIdWarnings);
                        const tagsWithIdWarnings = css[i].querySelectorAll('tag[k^="warning"]');
                        const nIdWarnings = getSumOfiDWarningsAndResolvedWarnings(tagsWithIdWarnings);

                        function getSumOfiDWarningsAndResolvedWarnings(tagsWithResolvedIdWarnings) {
                            let counter = 0;
                            tagsWithResolvedIdWarnings.forEach(tag => {
                                const value = +tag.getAttribute('v');
                                // console.log(value);
                                counter += value;
                            });
                            return counter;
                        }
                        changesets[cid].deltaInIdWarningsAndResolves = nIdResolvedWarnings - nIdWarnings;

                        ////Get name of used OSM editor

                        const osmEditorTag = css[i].querySelector('tag[k="created_by"]');
                        if (osmEditorTag)
                            changesets[cid].osmEditor = osmEditorTag.getAttribute('v');
                    }
                });

                /*Vandalism Checker
                Simple sanity checker for all the downloaded changesets. 3 things are checked:
                1. It summarizes the number of all elements which have been added or deleted
                1. It summarizes the number of all elements which have been added or deleted
                3. It summarizes the number of all iD warnings and resolved iD warnings
                for each changeset. If the sum is below a certain treshold (currently -3) then a traffic light changes to red to alert the user
                of this changeset.*/
                function vandalismChecker() {
                    // console.log(elements);
                    for (let i = 0; i < elements.length; i++) {
                        //Get type, i.e. "create", "modify" or "delete"
                        const type = elements[i].getAttribute("type");
                        // console.log(type);

                        //Get changeset number
                        let changesetNumber
                        if (type === "create") changesetNumber = elements[i].lastElementChild.getAttribute("changeset");
                        else changesetNumber = elements[i].lastElementChild.firstElementChild.getAttribute("changeset");
                        // console.log(changesetNumber);

                        //Check which action is performed
                        //"Create"
                        //deltaInNodesWays++
                        //deltaInTags += nTagsAdded
                        if (type === "create" && changesets[changesetNumber]) {
                            //Check the amount of tags that have been added
                            const nTagsAdded = elements[i].lastElementChild.querySelectorAll("tag").length;
                            // console.log(nTagsAdded);
                            changesets[changesetNumber].deltaInTags += nTagsAdded;

                            //If a node with 0 tags has been created: Do not add it to deltaInNodesWays
                            //(normally it is just a newly created node of an already existing way)

                            //Get element type (i.e. "node" or "way")
                            const elementType = elements[i].firstElementChild.nodeName;
                            // console.log(elementType);

                            if (elementType === "node" && nTagsAdded == 0) continue;
                            else changesets[changesetNumber].deltaInNodesWays++;
                        }

                        // "Modify"
                        //deltaInNodesWays = unchanged
                        //deltaInTags += nTagsNew - nTagsOld
                        if (type === "modify" && changesets[changesetNumber]) {
                            const nTagsNew = elements[i].lastElementChild.firstElementChild.querySelectorAll("tag").length;
                            const nTagsOld = elements[i].firstElementChild.firstElementChild.querySelectorAll("tag").length;
                            // console.log(nTagsNew);
                            // console.log(nTagsOld);
                            changesets[changesetNumber].deltaInTags += (nTagsNew - nTagsOld);
                        }

                        // "Delete"
                        //deltaInNodesWays--
                        //deltaInTags -= nTags
                        if (type === "delete" && changesets[changesetNumber]) {
                            const nTagsDeleted = elements[i].firstElementChild.querySelectorAll("tag").length;
                            // console.log(nTagsDeleted);
                            changesets[changesetNumber].deltaInTags -= nTagsDeleted;

                            //If a node with 0 tags has been deleted: Do not subtract it from deltaInNodesWays
                            // (normally it is just a newly deleted node of an already existing way)

                            //Get element type (i.e. "node" or "way")
                            const elementType = elements[i].firstElementChild.firstElementChild.nodeName;
                            // console.log(elementType);
                            //Check the amount of tags before deletion
                            const nTagsBeforeDeletion = elements[i].firstElementChild.firstElementChild.querySelectorAll("tag").length;
                            // console.log(nTagsBeforeDeletion);
                            if (elementType === "node" && nTagsBeforeDeletion == 0) continue;
                            else changesets[changesetNumber].deltaInNodesWays--;
                        }
                    }

                    //Write boolean value 'possibleVandalims' into 'changesets'
                    for (const changeset in changesets) {
                        // console.log(changeset);

                        //Check how many warnings and resolves iD editor produced.
                        // console.log("Changeset number: " + changeset + ", deltaInIdWarningsAndResolves: " + changesets[changeset].deltaInIdWarningsAndResolves);

                        if ((changesets[changeset].deltaInNodesWays < vandalismThreshold) || (changesets[changeset].deltaInTags < vandalismThreshold) || (changesets[changeset].deltaInIdWarningsAndResolves < vandalismThreshold)) {
                            changesets[changeset].possibleVandalism = true;
                        }
                    }
                }

                // console.log(changesets);
                vandalismChecker();//Analyse each changeset and create boolean "possibleVandalism" within "changesets" object
                renderChangesetsList(changesets);//Render changesets list on the left side
            });
        }).get();
}

//Render changesets list on the left side
function renderChangesetsList(changesetsToDisplay) {
    const bytime = [];
    for (const k in changesetsToDisplay) {
        bytime.push(changesetsToDisplay[k]);
    }
    //Sort newest to oldest changeset
    bytime.sort(function (a, b) {
        return (+b.time) - (+a.time);
    });
    //From here onwards the creation of the changesets section starts
    const results = d3.select('#results').html("");
    const allresults = results
        .selectAll('div.result')
        .data(bytime, function (d) {
            return d.id;
        })
        .attr('class', 'result')
        .style('color', function (l) {
            return defineColor(l.time);
        });
    allresults.exit().remove();

    const rl = allresults.enter()
        .append('div')
        .attr('class', 'result')
        .attr('title', 'Changeset is highlighted on map')
        .style('color', function (l) {
            return defineColor(l.time);
        });
    // console.log(rl);
    allresults.order();

    rl.on('click', click);//Highlight changeset on click (desktop/mobile)
    rl.on('mouseover', click);//Highlight changeset on mouseover (desktop)

    //"Zoom to changeset" button
    rl.append('div')
        .classed('zoom', true)
        .attr('title', 'Zoom to changeset')
        //.html('&#x1F50E; ')//Unicode glyph for a loupe
        .on('click', function (d) {
            //Check each layer on the map. If it belongs to clicked changeset --> add it to a featureGroup
            //(featureGroup needed because layers with points only don't have a getBounds function)
            d3.event.preventDefault();
            const id = d.id ? d.id : d.feature.feature.properties.meta.changeset;
            const changesetLayers = L.featureGroup();
            leafletGeoJsonObject.eachLayer(function (l) {
                if (l.feature.properties.meta.changeset == id) l.addTo(changesetLayers);
            });
            //Zoom and pan to featureGroup
            map.fitBounds(changesetLayers.getBounds());
            //On small screens (screen width < 601px) scroll all the way down, so that map is completely visible on screen
            if (screen.width < 601) {
                let mapContainer = document.querySelector(".map-container");//does not work with map container, thus used "window" in the next line
                window.scrollTo({
                    top: 2222,
                    behavior: 'smooth'
                });
            }
        })
        .append('svg')
        .classed('loupe', true)
        .append('use')
        .attr('href', 'img/icons.svg#loupe');

    //Vandalism Checker traffic light
    let trafficLightContainer = rl.append("div")
        .classed("traffic-light-container", true)
        .attr('title', function (d) {
            const changesetNumber = d.id;
            const possibleVandalism = changesets[changesetNumber].possibleVandalism;
            const deltaInNodesWays = changesets[changesetNumber].deltaInNodesWays;
            const deltaInTags = changesets[changesetNumber].deltaInTags;
            const deltaInIdWarningsAndResolves = changesets[changesetNumber].deltaInIdWarningsAndResolves;
            const usedEditorWasId = changesets[changesetNumber].osmEditor.toLowerCase().startsWith("id");
            // console.log('OSM Editor: ' + changesets[changesetNumber].osmEditor + ', usedEditorWasId: ' + usedEditorWasId);
            let titleText;
            //Only show the line "All resolved iD warnings..." if the used editor was actually iD
            if (possibleVandalism) {
                titleText = `
This changeset is potentially destructive!
All added nodes/ways - All deleted nodes/ways: ${deltaInNodesWays}. ${deltaInNodesWays < vandalismThreshold ? "This is suspicious!" : ""}
All added tags - All deleted tags: ${deltaInTags}. ${deltaInTags < vandalismThreshold ? "This is suspicious!" : ""}
${usedEditorWasId ? `All resolved iD warnings - New iD warnings: ${deltaInIdWarningsAndResolves}. ${deltaInIdWarningsAndResolves < vandalismThreshold ? "This is suspicious!" : ""}` : ""}

Reminder: It is often NOT necessary to delete elements in OSM. For example a closed shop should be tagged as 'disused:shop'. One day a new shop might open at the same exact lot and the tags can be updated. The same is true for demolished buildings ('demolished:building')
`
            } else {
                titleText = `
This changeset looks good!
All added nodes/ways - All deleted nodes/ways: ${deltaInNodesWays}. ${deltaInNodesWays < vandalismThreshold ? "This is suspicious!" : ""}
All added tags - All deleted tags: ${deltaInTags}. ${deltaInTags < vandalismThreshold ? "This is suspicious!" : ""}
${usedEditorWasId ? `All resolved iD warnings - New iD warnings: ${deltaInIdWarningsAndResolves}. ${deltaInIdWarningsAndResolves < vandalismThreshold ? "This is suspicious!" : ""}` : ""}
`
            }
            return titleText;
        })
    let trafficLight = trafficLightContainer.append("div")
        .classed("traffic-light", true)
    trafficLight.append("span")
        .attr('class', function (d) {
            const changesetNumber = d.id;
            const possibleVandalism = changesets[changesetNumber].possibleVandalism;
            return (possibleVandalism ? "gray" : "green");
        });
    trafficLight.append("span")
        .attr('class', function (d) {
            const changesetNumber = d.id;
            const possibleVandalism = changesets[changesetNumber].possibleVandalism;
            return (possibleVandalism ? "red" : "gray");
        });

    //Text bubble span where symbol is inserted in case of comments for this changeset
    rl.append('span')
        .classed('text-bubble', true);

    //User name
    rl.append('a').html(function (d) {
        return d.user;
    })
        .attr('title', 'Go to OSM user page')
        .attr('target', '_blank')
        .attr('href', function (d) {
            return '//openstreetmap.org/user/' + d.user;
        });

    //Timespan since changeset creation
    rl.append('span')
        .attr('title', function (d) {
            return moment(d.time).format('MMM Do YYYY, h:mm:ss a');
        })
        .attr('class', 'date').text(function (d) {
            return moment(d.time).fromNow();
        });

    //Changeset text and changeset comment count (were downloaded separately from OSM API)
    rl.append('div').attr('class', 'changeset');
    rl.select('span.text-bubble').each(function (d) {
        if (d.discussionCount > 0) {
            // d3.select(this).html('&#128489; ');//Speech bubble glyphicon (doesn't work on Android, thus changed to SVG)
            d3.select(this).attr('title', `Changeset has ${d.discussionCount} comment${d.discussionCount !== 1 ? "s" : ""}`);
            d3.select(this).append('svg')
                .classed('text-bubble-svg', true)
                .append('use')
                .attr('href', 'img/icons.svg#speech-bubble');
        }
    });

    rl.select('div.changeset').each(function (d) {
        d3.select(this).html(
            '<a href="https://openstreetmap.org/browse/changeset/' + d.id + '" target="_blank" class="comment" title="Go to OSM changeset page">' +
            (d.comment || '<span class="no-comment">&mdash;</span>') +
            '</a>'
        );
    });
}

//Highlight clicked layer on map and in sidebar (happens when selecting element in sidebar or on map)
function click(d) {
    // console.log(d);
    var results = d3.select('#results');
    results
        .selectAll('div.result')
        .classed('active', function (_) {
            return _.id == (d.id || d.feature.feature.properties.meta.changeset);//'d.id' is available if changeset was selected in sidebar. 'd.feature...' is available in leaflet layer
        });
    //Reset the display of all map elements (to reset previously highlighted elements) 
    leafletGeoJsonObject.resetStyle();

    const id = d.id ? d.id : d.feature.feature.properties.meta.changeset; //'d.id' is available if changeset was selected in sidebar. 'd.feature...' is available in leaflet layer

    //Highlight all layers with a certain changeset number
    leafletGeoJsonObject.eachLayer(function (l) {
        if (l.feature.properties.meta.changeset == id) {
            l.setStyle({ color: '#008dff' });//Highlighting color: blue
        }
    });

    //Make sure that sidebar is displayed
    sidebar.classList.remove("hide");
}

//Filter changesets and update changesets list and GeoJSON data on map
function filterChangesets() {
    let foundChangesets = {};
    const searchTerm = document.querySelector(".search-changesets-field").value.toLowerCase();
    // console.log(searchTerm);
    const onlyRed = document.querySelector("#filter-red-checkbox").checked;//Is "onylRed" checkbox ticked?
    // If searchTerm is empty -->
    // If onlyRed tickbox is NOT ticked: Render the whole changeset object in list and on the map and quit this function
    // If onlyRed tickbox IS ticked: Filter out all objects which look clean (i.e. likely no vandalism)
    if (!searchTerm) {
        let changesetToRender = {};
        //if onlyRed is ticked --> filter out all changesets with "possibleVandalism=false"
        if (onlyRed) {
            let wholeChangesetWithOnlyRed = {};
            for (const changesetId in changesets) {
                if (changesets[changesetId].possibleVandalism) wholeChangesetWithOnlyRed[changesetId] = changesets[changesetId];
            }
            changesetToRender = wholeChangesetWithOnlyRed;
        } else changesetToRender = changesets;

        // console.table(changesetToRender);

        renderChangesetsList(changesetToRender);//Render all changesets in list
        displayGeoJson(changesetToRender);//Render map elements of all changesets
        return;
    }

    for (const changesetId in changesets) {
        // console.log(changesetId);

        //Skip, if only changesets with "possibleVandalism" are supposed to be shown and this one has "possibleVandalism=false"
        if (onlyRed && !changesets[changesetId].possibleVandalism) continue;

        //1. Search within COMMENTS for search term
        const commentToCheck = changesets[changesetId].comment;
        // console.log(commentToCheck);
        let modifiedComment = '';
        let foundAt;
        let start = 0;
        let previousStart = 0;
        let loopCounter = 0;

        while (foundAt !== -1) {
            //In case user deletes all input in search field
            if (!searchTerm) break;

            foundAt = commentToCheck.toLowerCase().indexOf(searchTerm, start);
            modifiedComment += commentToCheck.slice((previousStart == 0 && loopCounter == 0) ? 0 : previousStart + searchTerm.length, (foundAt !== -1) ? foundAt : undefined);
            if (foundAt !== -1) modifiedComment += `<span class='highlight'>${commentToCheck.slice(foundAt, foundAt + searchTerm.length)}</span>`;
            // console.log(text.slice(foundAt, foundAt + searchTerm.length));
            // console.log(modifiedComment);
            // if (foundAt !== -1) findIndices.push(foundAt);
            previousStart = foundAt;
            start = foundAt + 1;
            loopCounter++;
        }
        // console.log(modifiedComment);

        //2. Search within USER NAME for search term
        const userNameToCheck = changesets[changesetId].user;
        let modifiedUserName = '';
        start = 0;
        previousStart = 0;
        foundAt = 0;
        loopCounter = 0;

        while (foundAt !== -1) {
            //In case user deletes all input in search field
            if (!searchTerm) break;

            foundAt = userNameToCheck.toLowerCase().indexOf(searchTerm, start);
            modifiedUserName += userNameToCheck.slice((previousStart == 0 && loopCounter == 0) ? 0 : previousStart + searchTerm.length, (foundAt !== -1) ? foundAt : undefined);
            if (foundAt !== -1) modifiedUserName += `<span class='highlight'>${userNameToCheck.slice(foundAt, foundAt + searchTerm.length)}</span>`;
            // console.log(text.slice(foundAt, foundAt + searchTerm.length));
            // console.log(modifiedComment);
            // if (foundAt !== -1) findIndices.push(foundAt);
            previousStart = foundAt;
            start = foundAt + 1;
            loopCounter++;
        }
        // console.log(modifiedUserName);

        //Create entry in "foundChangesets" object if modified user name or comment is different than original one, i.e. it has <span> elements inside
        if (modifiedComment !== commentToCheck || modifiedUserName !== userNameToCheck) {
            foundChangesets[changesetId] = {
                id: changesetId,
                time: changesets[changesetId].time,
                user: modifiedUserName,
                comment: modifiedComment,
                discussionCount: changesets[changesetId].discussionCount,
                layers: changesets[changesetId].layers
            }
        }
    }
    // console.table(foundChangesets);
    renderChangesetsList(foundChangesets);
    displayGeoJson(foundChangesets);

    //Filter GeoJSON on map
    function displayGeoJson(changesets) {
        //Remove old GeoJSON
        leafletGeoJsonObject.eachLayer(function (l) {
            map.removeLayer(l);
        });

        //Add layers of filtered changesets back to the map
        for (const changeset of Object.values(changesets)) {
            // console.log(changesets.layers);
            for (let i = 0; i < changeset.layers.length; i++) {
                map.addLayer(changeset.layers[i]);
            }
        }
    }
}

//Show a modal with a message
function message(type, text) {
    // Get the infobox modal
    const infobox = document.querySelector(".infobox");

    infobox.classList.remove("show", "alarm", "success");
    void infobox.offsetWidth; //Found here: https://css-tricks.com/restart-css-animation/#update-another-javascript-method-to-restart-a-css-animation
    infobox.innerHTML = text;
    infobox.classList.add("show", type);
}

//Scroll to top when clicking on "Back-to-top" button
function scrollToTop() {
    sidebar.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

//Only show X to remove content of filter input after at least one char has been entered. Then launch filterChangesets function.
function showHideCrossThenFilter() {
    const searchTerm = document.querySelector(".search-changesets-field").value;
    const deleteFilterInput = document.querySelector(".delete-filter-input");
    if (searchTerm.length > 0) deleteFilterInput.classList.remove("hide");
    else deleteFilterInput.classList.add("hide");

    //Filter changesets
    filterChangesets();
}

//Check current zoom level of map and show info message, if zoomed out too far
map.on('zoom', updateMap);
//Update location in local storage when panning the map
map.on('drag', function (e) {
    localStorage.setItem('location-hash', location.hash);
});

//Update variable "daysToShow" after change in time range selector
d3.select('#resolution')
    .attr('title', 'Select a time range')
    .on('change', function () {
        switch (this.selectedIndex) {
            case 0: // last 24h
                daysToShow = 1;
                break;
            case 1: // last 3 days
                daysToShow = 3;
                break;
            case 2: // last week
                daysToShow = 7;
                break;
            case 3: // last month
                daysToShow = 30;
                break;
        }
        localStorage.setItem("resolution", daysToShow);
    });

//Start download on click of button
document.querySelector("#download-changesets-button").addEventListener("click", run);

//Once text is typed into the filter changeset input --> Start filterChangesets function
document.querySelector(".search-changesets-field").addEventListener("input", showHideCrossThenFilter);

//Remove content of "filter changeset input" once X is clicked
document.querySelector(".delete-filter-input").addEventListener("click", () => {
    document.querySelector(".search-changesets-field").value = "";
    filterChangesets();//Show all changesets
    document.querySelector(".delete-filter-input").classList.add("hide");//Hide X again
});

//Only show changesets with red traffic light when clicking on the "filter red" checkbox
document.querySelector("#filter-red-checkbox").addEventListener("click", (e) => {
    document.querySelector(".traffic-light-filter").classList.toggle("filter-red-color");
    filterChangesets();
});

//Display "Back-to-top" button if changesets in sidebar are overflowing and user scrolled down a bit
sidebar.addEventListener("scroll", event => {
    let toTop = document.querySelector(".to-top");
    // console.log(sidebar.scrollTop);
    if (sidebar.scrollTop > 50) toTop.classList.remove("hide");//display to-top button
    else toTop.classList.add("hide");//hide to-top button
});