// Basic png-tile layer taken from OpenStreetMap
var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

// Basic png-tile layer taken from the Humanitarian OpenStreetMap Team
var hot = L.tileLayer("https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; Tiles style by Humanitarian OpenStreetMap Team hosted by OpenStreetMap France.'
});

// Basic png-tile layer taken from esri
var esri = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Basic png-tile taken from wmflabs
var osm_gray = L.tileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; Tiles style from OpenStreetMap, hosted by wmflabs. <a href="https://wmflabs.org"></a>'
});

// Basic png-tile layer for background taken from rl-institute tile server serves zoom levels 5-9
var national_background = L.tileLayer("https://tile.rl-institut.de/data/nesp2_national_background/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '☮'
});

// Basic png-tile layer for overlays taken from rl-institute tile server serves zoom levels 5-9
var national_heatmap = L.tileLayer("https://tile.rl-institut.de/data/nesp2_national_heatmap/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: ''
});

// Basic png-tile layer for overlays taken from rl-institute tile server serves zoom levels 5-9
var national_grid = L.tileLayer("https://tile.rl-institut.de/data/nesp2_national_grid/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: ''
});

// Basic png-tile layer combines national grid, heatmap and background. Redundant. Serves Levels 5-9
var welcome_view = L.tileLayer("https://tile.rl-institut.de/data/nesp2_national_welcome-view/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: ''
});

function remove_layer(layer){
  if (map.hasLayer(layer) == true){
    map.removeLayer(layer);
  }
};

function add_layer(layer) {
  if (map.hasLayer(layer) == false){
    map.addLayer(layer);
  }
};

// Vector-tiles layer that has layer shapes and columns in its attribute table: id, name, source, type, wikidata, wikipedia, availability (int)
var statesLayer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_states/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    states: function(prop, zoom) {
      var col = "#ffff00";
      if (prop.availability === 7) { col = stateAvailabilityColor.green;}
      if (prop.availability === 6 || prop.availability === 5 || prop.availability === 3 ) { col = stateAvailabilityColor.yellow;}
      if (prop.availability === 4 || prop.availability === 2 || prop.availability === 1 ) { col = stateAvailabilityColor.orange;}
      if (prop.availability === 0) { col = stateAvailabilityColor.red;}
      return {
        weight: 1,
        color: "#000000",
        opacity: 0,
        fill: true,
        fillColor: col,
        fillOpacity: 0,
      }
    }
  }
});

// Vector-tiles layer that has higher resolution shapes and columns in its attribute table: id, name, source, type, wikidata, wikipedia, availability (int)
var selected_state_pbf = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_states_hr/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    states_hr: function(prop, zoom) {
      var col = "#ffff00";
      if (prop.name == selectedState) { return(SLstateSelection)}
      return (SLstates)
    }
  }
});


function redefine_selected_state_pbf() {
  selected_state_pbf = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_states/{z}/{x}/{y}.pbf", {
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      states: function(prop, zoom) {
        var col = "#ffff00";
        if (prop.name == selectedState) { return(SLstateSelection)}
        return (SLstates)
      }
    }
  });
};

function update_selected_state_pbf(){
  remove_layer(selected_state_pbf);
  redefine_selected_state_pbf();
  add_layer(selected_state_pbf);
};

// Vector-tiles layer that has LGA shapes in high resolution and columns in its attribute table: id, name, source, type, wikidata, wikipedia
var lgas_pbf = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_lgas_hr/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    lgas_hr: function(prop, zoom) {
      if (prop.name == selectedLGA) { return(NLlgaSelection)}
      return (NLlga)
    }
  }
});

function remove_lgas_pbf() {
  if (map.hasLayer(lgas_pbf) == true){
    map.removeLayer(lgas_pbf);
  }
};

function add_lgas_pbf() {
  if (map.hasLayer(lgas_pbf) == false){
    map.addLayer(lgas_pbf);
  }
};

function redefine_lgas_pbf() {
  lgas_pbf = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_lgas_hr/{z}/{x}/{y}.pbf", {
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      states: function(prop, zoom) {
        if (prop.name == selectedLGA) { return(NLlgaSelection)}
        return (NLlga)
      }
    }
  });
};

function update_lgas_pbf(){
  remove_lgas_pbf;
  redefine_lgas_pbf();
  add_lgas_pbf();
};


// State borders and state hover functions

function highlightStateBorders(e) {
  var tooltipContent = "<b>" + e.target.feature.properties.name + "</b> Availability:<br>";
  var avail = {
    gridTracking: "<b>✕</b>",
    remoteMapping: "<b>✕</b>",
    Surveying: "<b>✕</b>",
  }
  if (e.target.feature.properties.availability >= 4) {avail.gridTracking = "<b>✓</b>";}
  if (e.target.feature.properties.availability % 4 >= 2) {avail.remoteMapping = "<b>✓</b>";}
  if (e.target.feature.properties.availability % 2 === 1) {avail.Surveying = "<b>✓</b>";}
  highlightLayer = e.target;
  if (highlightLayer.feature.properties.name != selectedState){
    highlightLayer.setStyle(statesStyleGeojsonHighlight);
  }
  else{
    highlightLayer.setStyle(statesStyleGeojsonTransparent);
  }
  if (map.hasLayer(info)){info.remove();};
  info.update = function (props) {
    this._div.innerHTML = '<h4 class="selection_detail_header">'+e.target.feature.properties.name+'</h4>' +
                          '<table class="selection_detail">' +
                          '<tr><td align="right"><b>Grid Tracking</b>:</td><td>' +avail.gridTracking+ '</td></tr>' +
                          '<tr><td align="right"><b>Remote Mapping</b>:</td><td>'+avail.remoteMapping+'</td></tr>' +
                          '<tr><td align="right"><b>Surveying</b>:</td><td>'+avail.Surveying+'</td></tr>' +
                          '</table>';
    this._div.innerHTML;
  };
  info.addTo(map);
}

function lowlightStateBorders(e) {
  lowlightLayer = e.target;
  lowlightLayer.setStyle(statesStyleGeojsonTransparent);
  info.remove();
}

function highlight_state(feature, layer) {
  layer.on({
    mouseover: highlightStateBorders,
    mouseout:  lowlightStateBorders,
  });
  layer.on('click',function() {
    // Update the name of the selected state only if different from the currently selected
    if (selectedState != feature.properties["name"]){
        selectedState = feature.properties["name"];
        document.getElementById("stateSelect").value = selectedState;
        // Trigger the switch to state level
        state_button_fun();
    }
  }
);
}

// Geojson layer formed from local json file. Used for hovering styles and clicking. Columns: id, name, source, type, wikidata, wikipedia, availability (int)
var nigeria_states_geojson = L.geoJSON(nigeria_states_simplified, {
  style: function (feature) {
    return(statesStyleGeojsonTransparent);
  },
  onEachFeature: highlight_state,
});


function zoomToSelectedState() {
  nigeria_states_geojson.eachLayer(function(layer) {
    if (layer.feature.properties.name == selectedState) {map.flyToBounds(layer.getBounds());}
  });
};

// Definitions and functions for the grid_layer

// Vector tiles layer that is adapted (URL) depending on the chosen state. Contains layers '11kV' and '33kV' Columns: several, but of no interest to the map
var grid_layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/" + gridLayers[selectedState] + "/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '11_kV': function(prop, zoom) {
      return gridStyle11kv
    },
    '33_kV': function(prop, zoom) {
      return gridStyle33kv
    },
  }
});

// Assign the selected state grid tile to the grid_layer
function redefine_grid_layer() {
  grid_layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/" + gridLayers[selectedState] + "/{z}/{x}/{y}.pbf", {
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      '11_kV': function(prop, zoom) {
        return gridStyle11kv
      },
      '33_kV': function(prop, zoom) {
        return gridStyle33kv
      },
    }
  });
};

// Update the state level grid layer with tiles
function update_grid_layer(){
  remove_layer(grid_layer);
  redefine_grid_layer();
  // Add the grid layer depending on grid checkbox value
  grid_cb_fun();
};

// Definitions and functions for the clusters_layer
// Vector tiles layer with clusters (populated areas). Contains layers 'regions' and 'kedco_lines'. regions-columns: admin1, admin2, area_km2, pop_hrsl
let vecTileLayer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    ng_cluster_attr: function(prop, zoom) {
      if (prop.FID > 0) {
        color = "red";
      } else {
        color = "lightgrey";
      }
      return {
          fill: true,
          fillColor: color,
          fillOpacity: 0.2,
          color: "red",
          weight: 1
      };
    },
    regions: function(prop, zoom) {
      if (zoom > 7) {
        return {
          stroke: false
        };
      } else {
        return {
          color: "LightGreen",
          weight: 5,
          opacity: 0.3
        };
      }
    },
    kedco_lines: {
      color: "#ff7800",
      weight: 2,
      opacity: 0.85,
      smoothFactor: 5
    }
  },
  maxZoom: 19,
  minZoom: 5,
  interactive: true,
  getFeatureId: function(f) {
    if (f.properties.FID !== undefined) {
      return f.properties.FID;
    }
    if (f.properties.osm_id !== undefined) {
      return "g" + f.properties.osm_id;
    }
    return "r" + f.properties.OBJECTID;
  }
})
.on("click", function(e) {
  console.log('click')
  this.clearHighlight();
  let properties = e.layer.properties;
  console.log(properties)
  if (properties.FID !== undefined) {
    var type = "c";
    var ID = properties.FID;
    var popup='\
      <table>\
        <tr><td align="right"><b>State</b>:</td><td>'+properties.admin1+'</td></tr>\
        <tr><td align="right"><b>LGA</b>:</td><td>'+properties.admin2+'</td></tr>\
        <tr><td align="right"><b>Area</b>:</td><td>'+parseFloat(properties.area_km2).toFixed(2)+' km2</td></tr>\
        <tr><td align="right"><b>Population</b>:</td><td>'+parseFloat(properties.pop_hrsl).toFixed(0)+'</td></tr>\
      </table>';
  } else if (properties.osm_id !== undefined) {
    var type = "g";
    var ID = "g" + properties.osm_id;
    var popup = '\
      <b>Voltage</b>: '+properties.voltage+' kV <br/>\
      <b>Operator</b>: '+properties.operator+'<br/>\
      ';
  } else {
    var type = "r";
    var ID = "r" + properties.OBJECTID;
  }
  if (type != "r") {
    L.popup()
    .setContent(popup)
    .setLatLng(e.latlng)
    .openOn(map);
    this.highlight = ID;
    let style = {
      fillColor: "#0000FF",
      fillOpacity: 0.5,
      stroke: true,
      fill: true,
      color: "#0000FF",
      opacity: 0.5,
      weight: 2
    };
    this.setFeatureStyle(ID, style);
    L.DomEvent.stop(e);
  }
  village_button_fun();
  map.flyTo([e.latlng.lat, e.latlng.lng], 14);
});

// Vector tiles layer with off-grid-clusters (remotely mapped villages). Contains layer 'OGClusters'. columns: cluster_offgrid_id, area_km2, building_count, large_building_count, percentage_large_building, building_area_km2, building_count_density_perkm2, percentage_building_area, grid_dist_km
let ogclustersTileLayer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_offgrid_clusters_kano/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    OGClusters: function(prop, zoom) {
      return {
          fill: true,
          fillColor: "#0000ff",
          fillOpacity: 0.2,
          color: "blue",
          weight: 1
      };
    },
  },
  maxZoom: 19,
  maxNativeZoom: 17,
  minZoom: 5,
  interactive: true,
  getFeatureId: function(f) {
    if (f.properties.FID !== undefined) {
      return f.properties.FID;
    }
    if (f.properties.osm_id !== undefined) {
      return "g" + f.properties.osm_id;
    }
    return "r" + f.properties.OBJECTID;
  }
})
.on("click", function(e) {
  console.log('click')
  this.clearHighlight();
  let properties = e.layer.properties;
  console.log(properties)
  var layer = e.target;

  //alert(parseFloat(properties.area_km2).toFixed(2));
  if (true) {
    var type = "c";
    var ID = properties.FID;
    var popup='\
      <table>\
        <tr><td align="right"><b>Area</b>:</td><td>'+parseFloat(properties.area_km2).toFixed(2)+' km2</td></tr>\
        <tr><td align="right"><b>Building Count</b>:</td><td>'+parseFloat(properties.building_count).toFixed(0)+'</td></tr>\
        <tr><td align="right"><b>Building Area in km²</b>:</td><td>'+parseFloat(properties.building_area_km2).toFixed(0)+'</td></tr>\
        <tr><td align="right"><b>Buildings per km²</b>:</td><td>'+parseFloat(properties.building_count_density_perkm2).toFixed(0)+'</td></tr>\
        <tr><td align="right"><b>Percentage Building Area</b>:</td><td>'+parseFloat(properties.percentage_building_area).toFixed(0)+'</td></tr>\
        <tr><td align="right"><b>Distance to Grid in km</b>:</td><td>'+parseFloat(properties.grid_dist_km).toFixed(0)+'</td></tr>\
      </table>';
  }
  if (type != "r") {
    L.popup()
    .setContent(popup)
    .setLatLng(e.latlng)
    .openOn(map);
    this.highlight = ID;
    let style = {
      fillColor: "#0000FF",
      fillOpacity: 0.5,
      stroke: true,
      fill: true,
      color: "#0000FF",
      opacity: 0.5,
      weight: 2
    };
    this.setFeatureStyle(ID, style);
    L.DomEvent.stop(e);
  }
})

ogclustersTileLayer.on("click", function (event) {
  map.options.maxZoom = 19;
  village_button_fun();
  map.flyToBounds([[event.layer.properties.bb_south,event.layer.properties.bb_west],[event.layer.properties.bb_north,event.layer.properties.bb_east]]);
});

