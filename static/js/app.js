// create a counter to track remaining async function calls
var remainingCalls = 5;
// create a variable to store results after fetching bike rack data
var bikeRackLayer = [];
// create a variable to store results after fetching street light data
var streetLightLayer = [];
// create a variable to store results after fetching crime data
var crimeLayer = [];
// create a variable to store results after selecting crime category data
var crimeGroup = [];
// Grab a reference to the dropdown select element
var crimeSelector = d3.select("#selCrime");
var locationSelector = d3.select("#selLocation");
// light tile layer
var lightMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 14,
    minZoom: 4,
    id: "mapbox.light",
    accessToken: API_KEY
});
// var DENVER = [39.7392, -104.9903]
var UNIVERSITY_OF_DENVER = [39.6766174, -104.9618965]
    // create map object and set default layers
var myMap = L.map("map", {
    center: UNIVERSITY_OF_DENVER,
    zoom: 13,
    layers: [lightMap]
});


// create a custom bike rack icon
var bikeRackIcon = L.icon({
    iconUrl: 'static/img/bike_rack.png',
    iconSize: [40, 40], // size of the icon
    iconAnchor: [20, 40], // point of the icon which will correspond to marker's location
    // popupAnchor:  [0, -20] // point from which the popup should open relative to the iconAnchor
});


// fetch dropdown data
d3.json("/offensetypes", function(offensetypes) {
    offensetypes.forEach((sample) => {
        crimeSelector
            .append("option")
            .text(sample)
            .property("value", sample);

    });
    --remainingCalls;
    console.log(`Fetched offense types. Remaining calls: ${remainingCalls}`)

    // check if ready to call createMap function
    if (remainingCalls === 0) {
        createMap(bikeRackLayer, streetLightLayer, crimeLayer)
    }
});

d3.json("/locations", function(locations) {
    locations.forEach((sample) => {
        locationSelector
            .append("option")
            .text(sample)
            .property("value", sample);

    });
    --remainingCalls;
    console.log(`Fetched offense types. Remaining calls: ${remainingCalls}`)

    // check if ready to call createMap function
    if (remainingCalls === 0) {
        createMap(bikeRackLayer, streetLightLayer, crimeLayer)
    }
});

// fetch bike rack data
d3.json('/bikeracks', function(bikeRacks) {
    // array to store bike rack markers
    var bikeRackMarkers = []
    var bikeLatLngs = []

    // loop through bike rack data
    for (var i = 0; i < bikeRacks.length; i++) {
        // create a reference variable for each object
        var bikeRack = bikeRacks[i];



        // add marker to map if located near University of Denver
        if (bikeRack.latitude && bikeRack.longitude !== null) {

            // add marker to map if located near University of Denver
            if (
                myMap.getBounds().contains([bikeRack.latitude, bikeRack.longitude])

            ) {
                bikeRackMarkers.push(
                    L.marker([bikeRack.latitude, bikeRack.longitude], { icon: bikeRackIcon })
                )
            }
        }
    }

    // use the bikeRackMarkers array to create a layer group
    bikeRackLayer = L.featureGroup(bikeRackMarkers);
    var bounds = new L.LatLngBounds(bikeLatLngs);
    myMap.fitBounds(bikeRackLayer.getBounds());

    // decrement remainingCalls by 1
    --remainingCalls;
    console.log(myMap.getBounds())
    console.log(`Fetched bike racks. Remaining calls: ${remainingCalls}`)

    // check if ready to call createMap function
    if (remainingCalls === 0) {
        createMap(bikeRackLayer, streetLightLayer, crimeLayer)
    }
});


// custom street light icon
var streetLightIcon = L.icon({
    iconUrl: 'static/img/street_light.png',
    iconSize: [30, 30], // size of the icon
    iconAnchor: [15, 30], // point of the icon which will correspond to marker's location
    // popupAnchor:  [0, -15] // point from which the popup should open relative to the iconAnchor
});


// fetch street light data
d3.json('/streetlights', function(streetLights) {
    // array to store bike rack markers
    var streetLightMarkers = []

    for (var i = 0; i < streetLights.length; i++) {
        // create a reference variable for each object
        var streetLight = streetLights[i];



        if (streetLight.latitude && streetLight.longitude !== null) {

            // add marker to map if located near University of Denver
            if (
                myMap.getBounds().contains([streetLight.latitude, streetLight.longitude])

            ) {
                streetLightMarkers.push(
                    L.marker([streetLight.latitude, streetLight.longitude], { icon: streetLightIcon })
                )
            }
        }
    }

    // use the streetLightMarkers array to create a layer group
    streetLightLayer = L.layerGroup(streetLightMarkers);

    // decrement remainingCalls by 1
    --remainingCalls;
    console.log(`Fetched street lights. Remaining calls: ${remainingCalls}`)

    // check if ready to call createMap function
    if (remainingCalls === 0) {
        createMap(bikeRackLayer, streetLightLayer, crimeLayer)
    }
});



// fetch crime data
d3.json('/crimes', function(crimes) {
    // array to store crime coordinates
    var heatArray = []

    for (var i = 0; i < crimes.length; i++) {
        // create a reference variable for each object
        var crime = crimes[i];

        // add marker to map if located near University of Denver

        if (
            crime.latitude > 39.6604741 &&
            crime.latitude < 39.6893281 &&
            crime.longitude > -104.9897327 &&
            crime.longitude < -104.9429236
        ) {
            heatArray.push([crime.latitude, crime.longitude])
        }
    }

    // use heatArray to create a layer group
    crimeLayer = L.heatLayer(heatArray, {
        radius: 20,
        blur: 35
    });

    // decrement remainingCalls by 1
    --remainingCalls;
    console.log(`Fetched crimes. Remaining calls: ${remainingCalls}`)

    // check if ready to call createMap function
    if (remainingCalls === 0) {
        createMap(bikeRackLayer, streetLightLayer, crimeLayer)
    }
});


// create map after all async function calls are complete
function createMap(bikeRackLayer, streetLightLayer, crimeLayer) {


    // dark tile layer
    var darkMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 14,
        minZoom: 4,
        id: "mapbox.dark",
        accessToken: API_KEY
    });

    // create a baseMaps object to hold our base layers
    var baseMaps = {
        "Light Map": lightMap,
        "Dark Map": darkMap
    };

    // create a overlayMaps object to hold our overlay layers
    var overlayMaps = {
        "Bike Racks": bikeRackLayer,
        "Street Lights": streetLightLayer,
        "Crime": crimeLayer,
    };



    // add the layer control to the map
    L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(myMap);

}


//populates map with crimes based on dropdown selection
function populateMapCrime(crime, location) {
    d3.json(`/crimeMap/${crime}/${location}`, function(theftData) {
        console.log(theftData)

        //makes crimeGroup a layer
        crimeGroup = L.featureGroup()

        // loop through crime data
        for (var i = 0; i < theftData.length; i++) {
            // create a reference variable for each object
            var theft = theftData[i];

            // add marker to map if located near University of Denver
            if (theft.latitude && theft.longitude !== null) {
                L.marker([theft.latitude, theft.longitude])
                    .bindPopup(
                        `<p>Address: ${theft.CRIME_ADDRESS}<br 
                />Date: ${theft.Date}<br
                />Crime: ${theft.CRIME_CATEGORY}
                </p>`).openPopup()
                    .addTo(crimeGroup)
            }


        }
        myMap.fitBounds(crimeGroup.getBounds());

        console.log(myMap.getBounds())
        crimeGroup.addTo(myMap)


    })
}

// creates piechart with info about different types of crime within category based on dropdown selection
function buildCharts(crime, location) {
    d3.json(`/crimetypechart/${crime}/${location}`,
        function(response) {
            var pieData = [{
                values: response.counts,
                labels: response.crime_types,
                // text: response.otu_labels.slice(0, 10),
                type: 'pie'

            }]

            var pieLayout = {
                title: "Type of Crime in Category",
                height: 500,
                width: "100%"
            };

            Plotly.newPlot('typepie', pieData, pieLayout);

        })
}

// build charts and populate map when new sample is selected
function optionChanged() {

    var crimeSelect = document.getElementById("selCrime");
    var crimeResult = crimeSelect.options[crimeSelect.selectedIndex].value;

    var locSelect = document.getElementById("selLocation");
    var locResult = locSelect.options[locSelect.selectedIndex].value;
    // Fetch new data each time a new sample is selected
    buildCharts(crimeResult, locResult);

    //if crimeGroup is already populated, remove contents from map
    if (crimeGroup.length != 0) {
        crimeGroup.eachLayer(function(layer) {
            myMap.removeLayer(layer)
        })
    }

    var e = document.getElementById("selCrime");
    var result = e.options[e.selectedIndex].value;
    console.log(crimeGroup.length != 0)
    console.log(result)
    populateMapCrime(crimeResult, locResult);

}