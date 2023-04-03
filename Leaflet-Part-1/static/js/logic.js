// Store our API endpoing as queryURL
var queryURL = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


d3.json(queryURL).then(function(data){
    createFeatures(data.features);
  });
    

function createFeatures(earthquakeData, platesData){

    // popup describing the place and time of the earthquakes
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // markers for the earthquakes
    function createCircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*6,
        fillColor: chooseColor(feature.properties.mag),
        color: chooseColor(feature.properties.mag),
        weight: 2,
        opacity: 0.4,
        // fillOpacity: 0.4
       } 
       return L.circleMarker(latlng,options);
    }
    // Create a variable for earthquakes to house latlng, each feature for popup, and cicrle radius/color/weight/opacity
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    // Send earthquakes layer to the createMap function - will start creating the map and add features
    createMap(earthquakes);
    }


    function chooseColor(mag){
        switch(true){
            case(1.0 <= mag && mag <= 2.5):
                return "#005900"; // Strong blue
            case (2.5 <= mag && mag <=4.0):
                return "#443500";
            case (4.0 <= mag && mag <=5.5):
                return "#490d00";
            case (5.5 <= mag && mag <= 8.0):
                return "#8a034f";
            case (8.0 <= mag && mag <=20.0):
                return "#005a8a";
            default:
                return "#585858";
        }
    }

    // Create map legend 
    let legend = L.control({position: 'bottomright'});

    legend.onAdd = function() {
        var div = L.DomUtil.create('div', 'info legend');
        var grades = [1.0, 2.5, 4.0, 5.5, 8.0];
        var labels = [];
        var legendInfo = "<h3>Magnitude</h3>";

        div.innerHTML = legendInfo

        // go through each magnitude item to label and color the legend
        // push to labels array as list item
        for (var i = 0; i < grades.length; i++) {
            labels.push('<ul style="background-color:' + chooseColor(grades[i] + 1) + '"> <span>' + grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '' : '+') + '</span></ul>');
            }

        // add each label list item to the div under the <ul> tag
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        
        return div;
    };


    // Create map
    function createMap(earthquakes) {


        // Create the base layers.
        let street = L.tileLayer(
            "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }
        );

        let topo = L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
            attribution:
                'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
        });


        //Create a baseMaps object//
        let baseMaps = {
            "Street Map": street,
            "Topographic Map": topo
        };


        // Create overlay object to hold our overlay layer
        let overlayMaps = {
            Earthquakes: earthquakes
        };

        // Create our map, giving it the streetmap and earthquakes layers to display on load
        let myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [street, earthquakes]
        });
        // Add the layer control to the map
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
        legend.addTo(myMap);
        }
