//Instantiate map
var map = L.map('map', {
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

            let controlUI = L.DomUtil.create('a', 'leaflet-toggle-sidebar', controlDiv);
            controlUI.title = 'Toggle display of sidebar <Spacebar>';
            controlUI.href = '#';

            let barIcon = L.DomUtil.create('span', 'leaflet-control-toggle-icon', controlUI);

            return controlDiv;
        }
    });
let toggleSidebarButton = new L.Control.toggleSidebarButton();
map.addControl(toggleSidebarButton);

//Toggle sidebar class and update Leaflet map size
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

//Toggle display of sidebar on press of Spacebar
document.addEventListener("keyup", event => {
    // console.log(event.key);
    event.preventDefault(); //prevent default, i.e. "page down" for spacebar
    if (event.key == " ") {
        toggleSidebar();
    };
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

//Update hash on map pan/zoom (functionality from leaflet-hash.js)
map.addHash();

//Map attribution
map.attributionControl.setPrefix('');
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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
        button.title = "Zoom in to view changes";
        return false;
    }
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
const vandalismCheckResult = {};
const deletedElementsLimit = -3; //If 3 more elements or tags have been deleted than added, the traffic light will change to red
let xhr;
let layer = null;

//Check if map is zoomed in enough
const isMapZoomedInEnough = updateMap();
if (isMapZoomedInEnough) run();

//Start download of changeset data
function run() {

    let users = [];
    let editors = [];

    d3.select('#map').classed('faded', true);//Map displayed greyish (Cannot go into "toggleWaitingScreen()" because we want to keep the map greyed out in case of unsuccessful overpass query)
    toggleWaitingScreen();
    if (xhr) xhr.abort();
    const bounds = map.getBounds();
    const bbox = bounds.getSouthWest().lat + ',' +
        bounds.getSouthWest().wrap().lng + ',' +
        bounds.getNorthEast().lat + ',' +
        bounds.getNorthEast().wrap().lng;
    const pointInTimeToStartAnalysis = (new Date(new Date() - 1000 * 60 * 60 * 24 * daysToShow)).toISOString();
    const overpass_query = '[adiff:"' + pointInTimeToStartAnalysis + '"][bbox:' + bbox + '][out:xml][timeout:22];way->.ways;(.ways>;node;);out meta;.ways out geom meta;';
    // console.log(overpass_server + 'interpreter?data=' + overpass_query);

    //Either do an API call to Overpass or use a locally saved xml file for debugging purposes
    const xmlDataLocation = overpass_server + 'interpreter?data=' + overpass_query; //API call to overpass
    // const xmlDataLocation = "./examples/example.xml"; //To load example xml: Comment out line above and uncomment this line

    xhr = d3.xml(xmlDataLocation
    ).on("error", function (error) {
        toggleWaitingScreen();
        message("alarm", "Server error: " + error.statusText); //Error message in case of no results from Overpass
    })
        .on('load', function (data) {
            // console.log(data);
            vandalismChecker();//Create object with vandalism analysis for each downloaded changeset
            var newData = document.implementation.createDocument(null, 'osm');
            var oldData = document.implementation.createDocument(null, 'osm');
            var elements = data.querySelectorAll('action');
            for (var i = 0; i < elements.length; i++) {
                var element = elements[i];
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
                            var nds = newElement.getElementsByTagName('nd');
                            for (var j = 0; j < nds.length; j++) {
                                var nodeId = nds[j].getAttribute('ref');
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

            d3.select('#map').classed('faded', false);
            toggleWaitingScreen();
            layer && map.removeLayer(layer);

            var datescale = d3.time.scale()
                .domain([new Date(pointInTimeToStartAnalysis), new Date()])
                .range([0, 1]);
            var colint = d3.interpolateRgb('#777', '#f00');

            layer = new L.GeoJSON({
                type: 'FeatureCollection',
                features: [].concat(oldGeojson.features).concat(newGeojson.features)
            }, {
                style: setStyle,
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, { radius: 8 });
                },
                onEachFeature: onEachFeature
            })
                .addTo(map);

            function setStyle(f) {
                return {
                    color: colint(datescale(new Date(f.properties.meta.timestamp))),
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
                    layer.setStyle({ weight: 8 });
                });

                //Change line weight back when feature loses focus
                layer.on('mouseout', function (e) {
                    layer.setStyle({ weight: 3 });
                });
            }

            var bytime = [];
            var changesets = {};
            let allFeatures = [];

            layer.eachLayer(function (l) {
                if (!l.feature.properties.meta.changeset) return;
                allFeatures.push(l); 
                changesets[l.feature.properties.meta.changeset] = changesets[l.feature.properties.meta.changeset] || {
                    id: l.feature.properties.meta.changeset,
                    time: new Date(l.feature.properties.meta.timestamp),
                    user: l.feature.properties.meta.user,
                    comment: '',
                    features: []
                };
                changesets[l.feature.properties.meta.changeset].features.push(l);
                users.push(l.feature.properties.meta.user);
            });

            let uniqueUsers = [...new Set(users)];
            uniqueUsers = uniqueUsers.sort();
            uniqueUsers.unshift("<All>");

            let usersDropdown = d3.select("#users").on('change', function () {
                layer.eachLayer(function (l) {
                    map.removeLayer(l);
                });
                let selectedUser = d3.select("#users").selectAll("option")[0][this.selectedIndex].value;
                bytime = [];
                for (var k in changesets) {
                    if (selectedUser == "<All>" || changesets[k].user == selectedUser)
                        bytime.push(changesets[k]);
                }
                updateDivs();
                allFeatures.forEach(function (l) {
                    if (selectedUser == "<All>" || l.feature.properties.meta.user == selectedUser) {
                        map.addLayer(l);
                    }
                });
            });
            var options = usersDropdown.selectAll("option")
                .data(uniqueUsers)
                .enter()
                .append("option");
            options.text(function(d) {
                return d;
            }).attr("value", function(d) {
                return d;
            });

            for (var k in changesets) {
                bytime.push(changesets[k]);
            }

            layer.on('click', function (e) {
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

            //Vandalism Checker
            //Simple sanity checker for all the downloaded changesets. It summarizes all elements and tags which have been added or deleted
            //in the changeset. If the sum is below a certain treshold (currently -3) then a traffic light changes to red to alert the user
            //of this changeset.
            function vandalismChecker() {
                let actions = data.querySelectorAll("action");
                // console.log(actions);
                for (let i = 0; i < actions.length; i++) {
                    //Get type, i.e. "create", "modify" or "delete"
                    const type = actions[i].getAttribute("type");
                    // console.log(type);

                    //Get changeset number
                    let changesetNumber
                    if (type === "create") changesetNumber = actions[i].lastElementChild.getAttribute("changeset");
                    else changesetNumber = actions[i].lastElementChild.firstElementChild.getAttribute("changeset");
                    // console.log(changesetNumber);

                    //Create empty changeset object, if new.
                    if (!vandalismCheckResult[changesetNumber]) vandalismCheckResult[changesetNumber] = { deltaInNodesWays: 0, deltaInTags: 0, possibleVandalism: false };

                    //Check which action is performed
                    //"Create"
                    //deltaInNodesWays++
                    //deltaInTags += nTagsAdded
                    if (type === "create") {
                        //Check the amount of tags that have been added
                        const nTagsAdded = actions[i].lastElementChild.querySelectorAll("tag").length;
                        // console.log(nTagsAdded);
                        vandalismCheckResult[changesetNumber].deltaInTags += nTagsAdded;

                        //If a node with 0 tags has been created: Do not add it to deltaInNodesWays
                        //(normally it is just a newly created node of an already existing way)

                        //Get element type (i.e. "node" or "way")
                        const elementType = actions[i].firstElementChild.nodeName;
                        // console.log(elementType);

                        if (elementType === "node" && nTagsAdded == 0) continue;
                        else vandalismCheckResult[changesetNumber].deltaInNodesWays++;
                    }

                    // "Modify"
                    //deltaInNodesWays = unchanged
                    //deltaInTags += nTagsNew - nTagsOld
                    if (type === "modify") {
                        const nTagsNew = actions[i].lastElementChild.firstElementChild.querySelectorAll("tag").length;
                        const nTagsOld = actions[i].firstElementChild.firstElementChild.querySelectorAll("tag").length;
                        // console.log(nTagsNew);
                        // console.log(nTagsOld);
                        vandalismCheckResult[changesetNumber].deltaInTags += (nTagsNew - nTagsOld);
                    }

                    // "Delete"
                    //deltaInNodesWays--
                    //deltaInTags -= nTags
                    if (type === "delete") {
                        const nTagsDeleted = actions[i].firstElementChild.querySelectorAll("tag").length;
                        // console.log(nTagsDeleted);
                        vandalismCheckResult[changesetNumber].deltaInTags -= nTagsDeleted;

                        //If a node with 0 tags has been deleted: Do not subtract it from deltaInNodesWays
                        // (normally it is just a newly deleted node of an already existing way)

                        //Get element type (i.e. "node" or "way")
                        const elementType = actions[i].firstElementChild.firstElementChild.nodeName;
                        // console.log(elementType);
                        //Check the amount of tags before deletion
                        const nTagsBeforeDeletion = actions[i].firstElementChild.firstElementChild.querySelectorAll("tag").length;
                        // console.log(nTagsBeforeDeletion);
                        if (elementType === "node" && nTagsBeforeDeletion == 0) continue;
                        else vandalismCheckResult[changesetNumber].deltaInNodesWays--;
                    }
                }
                for (const changeset in vandalismCheckResult) {
                    // console.log(changeset);
                    // console.log(vandalismCheckResult[changeset].deltaInNodesWays);
                    if ((vandalismCheckResult[changeset].deltaInNodesWays < deletedElementsLimit) || (vandalismCheckResult[changeset].deltaInTags < deletedElementsLimit)) {
                        vandalismCheckResult[changeset].possibleVandalism = true;
                    }
                }
                // console.log(vandalismCheckResult);
            }

            //Create tag comparison table
            function createTable(id) {
                {
                    const node = data.querySelectorAll('[id="' + id + '"]');
                    //First check what type of action has been performed on the element (i.e. create, modify, delete)
                    let action = node[0].parentNode.parentNode.getAttribute('type');//Check if action is "modify", "delete" or "null"
                    if (!action) action = "create";//The xml data structure is different for "create" nodes, thus action will be "null" in the line above
                    // console.log(action);

                    //Create header with element info
                    let tableHtml = `<span class="${action} capitalize">${action}</span> ${node[0].nodeName} <a href="https://www.openstreetmap.org/${node[0].nodeName}/${node[0].getAttribute("id")}" target="_blank" rel="noopener noreferrer">${node[0].getAttribute("id")}</a>`;
                    // document.querySelector("#element-info").innerHTML = elementInfoHtml;

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
                                    <td>${node[0].getAttribute("timestamp")}</td>
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
                            // else continue;
                            // Better option: Add a class "unchanged", hide them and add a button to show similar tags
                            // Table height needs to update see https://leafletjs.com/reference.html#divoverlay-contentupdate
                            // table rows can be animated https://stackoverflow.com/a/37376274/5263954

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

                    //Create link to edit geometry in iD editor
                    tableHtml += `<a href="https://www.openstreetmap.org/edit?${node[0].nodeName}=${node[0].getAttribute("id")}" target="_blank" rel="noopener noreferrer">Edit in iD</a>`;

                    return tableHtml;
                }
            }

            bytime.sort(function (a, b) {
                return (+b.time) - (+a.time);
            });

            var results = d3.select('#results');

            //Highlight clicked layer on map and in sidebar
            function click(d) {
                results
                    .selectAll('div.result')
                    .classed('active', function (_) {
                        return _.id == (d.id || d.feature.feature.properties.meta.changeset);
                    });
                layer.eachLayer(function (l) {
                    layer.resetStyle(l);
                })
                var id = d.id ? d.id : d.feature.feature.properties.meta.changeset;
                layer.eachLayer(function (l) {
                    if (l.feature.properties.meta.changeset == id) {
                        l.setStyle({ color: '#008dff' });
                    }
                });

                //Make sure that sidebar is displayed
                sidebar.classList.remove("hide");
            }

            updateDivs();

            function updateDivs() {
                var allresults = results
                    .selectAll('div.result')
                    .data(bytime, function (d) {
                        return d.id;
                    })
                    .attr('class', 'result')
                    .style('color', function (l) {
                        return colint(datescale(l.time));
                    });
                allresults.exit().remove();

                var rl = allresults.enter()
                    .append('div')
                    .attr('class', 'result')
                    .attr('title', 'Changeset is highlighted on map')
                    .style('color', function (l) {
                        return colint(datescale(l.time));
                    });
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
                        var id = d.id ? d.id : d.feature.feature.properties.meta.changeset;
                        var changesetLayers = L.featureGroup();
                        layer.eachLayer(function (l) {
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
                        const possibleVandalism = vandalismCheckResult[changesetNumber].possibleVandalism;
                        const deltaInNodesWays = vandalismCheckResult[changesetNumber].deltaInNodesWays;
                        const deltaInTags = vandalismCheckResult[changesetNumber].deltaInTags;
                        let titleText;
                        if (possibleVandalism) {
                            titleText = `This changeset is potentially destructive!
Sum of all added/deleted nodes or ways: ${deltaInNodesWays}. ${deltaInNodesWays < deletedElementsLimit ? "This is suspicious!" : ""}
Sum of all added/deleted tags: ${deltaInTags}. ${deltaInTags < deletedElementsLimit ? "This is suspicious!" : ""}

Reminder: It is often NOT necessary to delete elements in OSM. For example a closed shop should be tagged as 'disused:shop'. One day a new shop might open at the same exact lot and the tags can be updated. The same is true for demolished buildings ('demolished:building')
`
                        } else {
                            titleText = `This changeset looks good!
Sum of all added/deleted nodes or ways: ${deltaInNodesWays}. ${deltaInNodesWays < deletedElementsLimit ? "This is suspicious!" : ""}
Sum of all added/deleted tags: ${deltaInTags}. ${deltaInTags < deletedElementsLimit ? "This is suspicious!" : ""}`
                        }
                        return titleText;
                    })
                let trafficLight = trafficLightContainer.append("div")
                    .classed("traffic-light", true)
                trafficLight.append("span")
                    .attr('class', function (d) {
                        const changesetNumber = d.id;
                        const possibleVandalism = vandalismCheckResult[changesetNumber].possibleVandalism;
                        return (possibleVandalism ? "gray" : "green");
                    });
                trafficLight.append("span")
                    .attr('class', function (d) {
                        const changesetNumber = d.id;
                        const possibleVandalism = vandalismCheckResult[changesetNumber].possibleVandalism;
                        return (possibleVandalism ? "red" : "gray");
                    });

                //Text bubble span where symbol is inserted in case of comments for this changeset
                rl.append('span')
                    .classed('text-bubble', true);

                //User name
                rl.append('a').text(function (d) {
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

                //link to achavi (temporarily hidden. To be discussed, if needed or not)
                // rl.append('span').text(' ');
                // rl.append('a').attr('class', 'reveal').text('«achavi»')
                //     .attr('target', '_blank')
                //     .attr('title', 'Get details about this changeset on Achavi')
                //     .attr('href', function (d) {
                //         return 'https://overpass-api.de/achavi/?changeset=' + d.id;
                //     });

                //Changeset information
                rl.append('div').attr('class', 'changeset');
                var queue = d3.queue();
                var changesetIds = rl.data()
                    .map(function (d) { return d.id })
                    .filter(function (changesetId) { return changesetId !== ''; });
                while (changesetIds.length > 0) {
                    queue.defer(d3.xml, 'https://www.openstreetmap.org/api/0.6/changesets?changesets=' + changesetIds.splice(0, 100).join(','));
                }
                queue.awaitAll(function (error, xmls) {
                    if (error) return console.error(error);

                    var changesets = {};
                    xmls.forEach(function (xml) {
                        var css = xml.getElementsByTagName('changeset');
                        for (var i = 0; i < css.length; i++) {
                            var cid = css[i].getAttribute('id');
                            changesets[cid] = {
                                discussionCount: +css[i].getAttribute("comments_count")
                            };
                            var tag = css[i].querySelector('tag[k="comment"]');
                            if (tag)
                                changesets[cid].comment = tag.getAttribute('v');
                            tag = css[i].querySelector('tag[k="created_by"]');
                            if (tag) {
                                changesets[cid].created_by = tag.getAttribute('v');
                                editors.push(changesets[cid].created_by);
                            }
                        }
                    });

                    // this is not working - probably due to a different context (updateDivs calling itself)
                    // but the problem here is that we get the changeset details rather late
                    
                    // let uniqueEditors = [...new Set(editors)];
                    // uniqueEditors = uniqueEditors.sort();
                    // uniqueEditors.unshift("<All>");
        
                    // let editorsDropdown = d3.select("#editors").on('change', function () {
                    //     let selectedEditor = d3.select("#editors").selectAll("option")[0][this.selectedIndex].value;
                    //     bytime = [];
                    //     for (var k in changesets) {
                    //         if (selectedEditor == "<All>" || changesets[k].created_by == selectedEditor)
                    //             bytime.push(changesets[k]);
                    //     }
                    //     updateDivs();
                    // });
                    // var options = editorsDropdown.selectAll("option")
                    //     .data(uniqueEditors)
                    //     .enter()
                    //     .append("option");
                    // options.text(function(d) {
                    //     return d;
                    // }).attr("value", function(d) {
                    //     return d;
                    // });
                            
                    rl.select('span.text-bubble').each(function (d) {
                        if (changesets[d.id].discussionCount > 0) {
                            // d3.select(this).html('&#128489; ');//Speech bubble glyphicon (doesn't work on Android, thus changed to SVG)
                            d3.select(this).attr('title', `Changeset has ${changesets[d.id].discussionCount} comment${changesets[d.id].discussionCount !== 1 ? "s" : ""}`);
                            d3.select(this).append('svg')
                                .classed('text-bubble-svg', true)
                                .append('use')
                                .attr('href', 'img/icons.svg#speech-bubble');
                        }
                    });
                    rl.select('div.changeset').each(function (d) {
                        d3.select(this).html(
                            '<a href="https://openstreetmap.org/browse/changeset/' + d.id + '" target="_blank" class="comment" title="Go to OSM changeset page">' +
                            (changesets[d.id].comment || '<span class="no-comment">&mdash;</span>') +
                            '</a>'
                        );
                    });
                });
            }
        }).get();
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

//Check current zoom level of map and show info message, if zoomed out too far
map.on('zoom', updateMap);
//Update location in local storage
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

//Display "Back-to-top" button if changesets in sidebar are overflowing and user scrolled down a bit
sidebar.addEventListener("scroll", event => {
    let toTop = document.querySelector(".to-top");
    // console.log(sidebar.scrollTop);
    if (sidebar.scrollTop > 50) toTop.classList.remove("hide");//display to-top button
    else toTop.classList.add("hide");//hide to-top button
});

//Scroll to top when clicking on "Back-to-top" button
function scrollToTop() {
    sidebar.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}