// store url
let url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";


d3.json(url).then(function(data){
    createFeatures(data.features);
  });
    

function createFeatures(earthquakeData){

    // popup describing the place and time of the earthquakes
    function onEachFeature(feature, layer){
        layer.bindPopup(`<h3>Where: ${feature.properties.place}</h3><hr><p>Time: ${new Date(feature.properties.time)}</p><hr><p>Magnitude: ${feature.properties.mag}</p><hr><p>Number of "Felt" Reports: ${feature.properties.felt}`);
    }

    // markers for the earthquakes
    function createCircleMarker(feature, latlng){
       let options = {
        radius:feature.properties.mag*5,
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        color: chooseColor(feature.geometry.coordinates[2]),
        weight: 2,
        opacity: 0.9,
       } 
       return L.circleMarker(latlng,options);
    }
    // create a variable for earthquakes 
    let earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircleMarker
    });

    createMap(earthquakes);
    }

    // depending on depth the different color should be chosen. Tried switch case method 
    function chooseColor(depth){
        switch(true){
            default:
                return "#dcbeff"; // lavender
            break;
            case (1.0 <= depth && depth <= 15.0):
                return "#f58231"; // orange
            case (15.0 <= depth && depth <=30.0):
                return "#bfef45"; // lime
            case (30.0 <= depth && depth <=55.0):
                return "#911eb4"; // purple
            case (55.0 <= depth && depth <= 70.0):
                return "#469990"; // teal           
        }
    }

    // create map legend 
    let legend = L.control({position: 'bottomleft'});

  
    // Generic class for handling a tiled grid of HTML elements. 
    // This is the base class for all tile layers and replaces TileLayer.Canvas. 
    // GridLayer can be extended to create a tiled grid of HTML elements like <canvas>, <img> or <div>. 
    // GridLayer will handle creating and animating these DOM elements for you.
   

    legend.onAdd = function() {
        let div = L.DomUtil.create('div', 'legend');
        let ranges = [1.0, 15.0, 30.0, 55.0, 70.0];
        let labels = [];
        let legend = "<h3 style=text-align:center;>Earthquake Depth</h3>";

        div.innerHTML = legend

        // go through each magnitude item to label and color the legend
        // push to labels array as list item
        for (var i = 0; i < ranges.length; i++) {
            labels.push('<ul style="background-color:' + chooseColor(ranges[i] + 1) + '"> <span>' + ranges[i] + (ranges[i + 1] ? '&ndash;' + ranges[i + 1] + '' : '+') + '</span></ul>');
            }

        // add each label list item to the div under the <ul> tag
        div.innerHTML += "<ul>" + labels.join("") + "</ul>";
        
        return div;
    };


    // create map
    function createMap(earthquakes) {


        // create the base layers
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


        // create a baseMaps object
        let baseMaps = {
            "Street Map": street,
            "Topographic Map": topo
        };


        // create overlay object to hold our overlay layer
        let overlayMaps = {
            Earthquakes: earthquakes
        };

        // create our map, giving it the streetmap and earthquakes layers to display on load
        let myMap = L.map("map", {
            center: [37.09, -95.71],
            zoom: 5,
            layers: [street, earthquakes]
        });
        // add the layer control to the map
        L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
        }).addTo(myMap);
        legend.addTo(myMap);
        }
