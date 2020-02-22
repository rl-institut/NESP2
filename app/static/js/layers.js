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
  },
  maxZoom: 19,
  maxNaturalZoom: 14,
  minZoom: 5,
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
        // Update the dropdown menu for state selection
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
  // Avoid adding the selected state, to not cover the clusters
  filter: function (feature){return (selectedState != feature.properties["name"])
  }
});


function zoomToSelectedState() {
  nigeria_states_geojson.eachLayer(function(layer) {
    if (layer.feature.properties.name == selectedState) {
    map.flyToBounds(layer.getBounds(), {maxZoom: 9});}
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

// Adds functions for filters and styling to a defined input grid-cluster-Layer
function addFunctionsToClusterLayer(layer){
layer.on("click", function(e) {
  console.log('click')
  this.clearHighlight();
  let properties = e.layer.properties;
  console.log(properties)
  if (properties.cluster_all_id !== undefined) {
    var type = "c";
    var ID = properties.cluster_all_id;
    var popup='\
      <table>\
        <tr><td align="right"><b>ID</b>:</td><td>'+properties.cluster_all_id+'</td></tr>\
        <tr><td align="right"><b>Area</b>:</td><td>'+properties.area_km2+'</td></tr>\
        <tr><td align="right"><b>Distance to Grid</b>:</td><td>'+parseFloat(properties.grid_dist_km).toFixed(2)+' km2</td></tr>\
      </table>';
  } else {
    var type = "r";
    var ID = "r" + properties.OBJECTID;
  }
  if (type != "r") {
  clusterInfo.remove();
  clusterInfo.update = function () {
    this._div.innerHTML = popup;
    this._div.innerHTML;
  };
  clusterInfo.addTo(map);
    this.highlight = ID;
    let style = clusterSelectionStyle;
    this.setFeatureStyle(ID, style);
    L.DomEvent.stop(e);
  }
  map.on("click", function() {
    clusterInfo.remove();
  });
  map.flyToBounds([[e.layer.properties.bb_south,e.layer.properties.bb_west],[e.layer.properties.bb_north,e.layer.properties.bb_east]])
  });
  layer.filter = function(filter) {
    let newhiddenIDs = [];
    let vt = this._vectorTiles;
    for (let vtkey in vt) {
        let f = vt[vtkey]._features;
        for (let fkey in f) {
            
            let prop = f[fkey].feature.properties;
            if (typeof prop.area_km2 !== 'undefined'){
                if (!(prop.area_km2 > filter.minarea && prop.area_km2 < filter.maxarea && prop.grid_dist_km > filter.mindtg && prop.grid_dist_km < filter.maxdtg)) {
                    newhiddenIDs.push(prop.cluster_all_id);
                    if (this.hiddenIDs.indexOf(prop.cluster_all_id) == -1){
                        this.setFeatureStyle(prop.cluster_all_id, this.hiddenstyle);
                    }
                } else if (this.hiddenIDs.indexOf(prop.cluster_all_id) > -1){
                    this.resetFeatureStyle(prop.cluster_all_id);
                }
            }
        }
    }
    this.hiddenIDs = newhiddenIDs;
  };

  layer.on("load", function(e) {
    layer.filter(currentfilter);
  });
  layer.highlight = null;
  layer.hidden = null;
  layer.hiddenstyle = {
    fillColor: "lightgray",
    fillOpacity: 0.3,
    opacity: 0,
    fill: true,
    color: "lightgray"
  };
  layer.clearHidden = function() {
    if (this.hiddenIDs) {
        for (let i = 0, len = this.hiddenIDs.length; i < len; i++) {
            let id = this.hiddenIDs[i];
            this.resetFeatureStyle(id);
        }
    }
  };
  layer.clearHighlight = function() {
    if (this.highlight) {
        if (this.hiddenIDs && this.hiddenIDs.indexOf(this.highlight) > -1){
            this.setFeatureStyle(this.highlight, this.hiddenstyle);
        } else {
            this.resetFeatureStyle(this.highlight);
        }
    }
    this.highlight = null;
  };
  layer.on("load", function(e) {
    layer.filter(currentfilter);        
  });

  map.addEventListener("filterchange", function(filter) {
    layer.filter(currentfilter);
  });
  map.on("click", function() {
      layer.clearHighlight();
  });
}

function createNewClusterLayer(selectedState){
  var layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/" + selectedState + "/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    regions: function(prop, zoom) {
      if (prop.cluster_all_id > 0) {
        color = "red";
      } else {
        color = "lightgrey";
      }
      return(clustersStyle);
    },
  },
  maxZoom: 19,
  maxNativeZoom: 16,
  minZoom: 5,
  interactive: true,
  getFeatureId: function(f) {
    if (f.properties.cluster_all_id !== undefined) {
      return f.properties.cluster_all_id;
    }
    if (f.properties.osm_id !== undefined) {
      return "g" + f.properties.osm_id;
    }
    return "r" + f.properties.OBJECTID;
    }
  })
  addFunctionsToClusterLayer(layer);
  return(layer);
}

// Definitions and functions for the clusters_layer
// Vector tiles layer with clusters (populated areas). Contains layers 'regions' and 'kedco_lines'. regions-columns: admin1, admin2, area_km2, pop_hrsl
  var clusterLayerAbia = createNewClusterLayer("nesp2_state_clusters_abia");
  var clusterLayerAdamawa = createNewClusterLayer("nesp2_state_clusters_adamawa");
  var clusterLayerAkwaIbom = createNewClusterLayer("nesp2_state_clusters_akwa_ibom");
  var clusterLayerAnambra = createNewClusterLayer("nesp2_state_clusters_anambra");
  var clusterLayerBauchi = createNewClusterLayer("nesp2_state_clusters_bauchi");
  var clusterLayerBayelsa = createNewClusterLayer("nesp2_state_clusters_bayelsa");
  var clusterLayerBenue = createNewClusterLayer("nesp2_state_clusters_benue");
  var clusterLayerBorno = createNewClusterLayer("nesp2_state_clusters_borno");
  var clusterLayerCrossRiver = createNewClusterLayer("nesp2_state_clusters_cross_river");
  var clusterLayerDelta = createNewClusterLayer("nesp2_state_clusters_delta");
  var clusterLayerEbonyi = createNewClusterLayer("nesp2_state_clusters_ebonyi");
  var clusterLayerEdo = createNewClusterLayer("nesp2_state_clusters_edo");
  var clusterLayerEkiti = createNewClusterLayer("nesp2_state_clusters_ekiti");
  var clusterLayerEnugu = createNewClusterLayer("nesp2_state_clusters_enugu");
  var clusterLayerFederalCapitalTerritory = createNewClusterLayer("nesp2_state_clusters_federal_capital_territory");
  var clusterLayerGombe = createNewClusterLayer("nesp2_state_clusters_gombe");
  var clusterLayerImo = createNewClusterLayer("nesp2_state_clusters_imo");
  var clusterLayerJigawa = createNewClusterLayer("nesp2_state_clusters_jigawa");
  var clusterLayerKaduna = createNewClusterLayer("nesp2_state_clusters_kaduna");
  var clusterLayerKano = createNewClusterLayer("nesp2_state_clusters_kano");
  var clusterLayerKatsina = createNewClusterLayer("nesp2_state_clusters_katsina");
  var clusterLayerKebbi = createNewClusterLayer("nesp2_state_clusters_kebbi");
  var clusterLayerKogi = createNewClusterLayer("nesp2_state_clusters_kogi");
  var clusterLayerKwara = createNewClusterLayer("nesp2_state_clusters_kwara");
  var clusterLayerLagos = createNewClusterLayer("nesp2_state_clusters_lagos");
  var clusterLayerNasarawa = createNewClusterLayer("nesp2_state_clusters_nasarawa");
  var clusterLayerNiger = createNewClusterLayer("nesp2_state_clusters_niger");
  var clusterLayerOgun = createNewClusterLayer("nesp2_state_clusters_ogun");
  var clusterLayerOndo = createNewClusterLayer("nesp2_state_clusters_ondo");
  var clusterLayerOsun = createNewClusterLayer("nesp2_state_clusters_osun");
  var clusterLayerOyo = createNewClusterLayer("nesp2_state_clusters_oyo");
  var clusterLayerPlateau = createNewClusterLayer("nesp2_state_clusters_plateau");
  var clusterLayerRivers = createNewClusterLayer("nesp2_state_clusters_rivers");
  var clusterLayerSokoto = createNewClusterLayer("nesp2_state_clusters_sokoto");
  var clusterLayerTaraba = createNewClusterLayer("nesp2_state_clusters_taraba");
  var clusterLayerYobe = createNewClusterLayer("nesp2_state_clusters_yobe");
  var clusterLayerZamfara = createNewClusterLayer("nesp2_state_clusters_zamfara");

var clusterLayer = {
  "Abia": clusterLayerAbia,
  "Adamawa": clusterLayerAdamawa,
  "Akwa Ibom": clusterLayerAkwaIbom,
  "Anambra": clusterLayerAnambra,
  "Bauchi": clusterLayerBauchi,
  "Bayelsa": clusterLayerBayelsa,
  "Benue": clusterLayerBenue,
  "Borno": clusterLayerBorno,
  "Cross River": clusterLayerCrossRiver,
  "Delta": clusterLayerDelta,
  "Ebonyi": clusterLayerEbonyi,
  "Edo": clusterLayerEdo,
  "Ekiti": clusterLayerEkiti,
  "Enugu": clusterLayerEnugu,
  "Federal Capital Territory": clusterLayerFederalCapitalTerritory,
  "Gombe": clusterLayerGombe,
  "Imo": clusterLayerImo,
  "Jigawa": clusterLayerJigawa,
  "Kaduna": clusterLayerKaduna,
  "Kano": clusterLayerKano,
  "Katsina": clusterLayerKatsina,
  "Kebbi": clusterLayerKebbi,
  "Kogi": clusterLayerKogi,
  "Kwara": clusterLayerKwara,
  "Lagos": clusterLayerLagos,
  "Nasarawa": clusterLayerNasarawa,
  "Niger": clusterLayerNiger,
  "Ogun": clusterLayerOgun,
  "Ondo": clusterLayerOndo,
  "Osun": clusterLayerOsun,
  "Oyo": clusterLayerOyo,
  "Plateau": clusterLayerPlateau,
  "Rivers": clusterLayerRivers,
  "Sokoto": clusterLayerSokoto,
  "Taraba": clusterLayerTaraba,
  "Yobe": clusterLayerYobe,
  "Zamfara": clusterLayerZamfara,
}


// Adds functions for filters and styling to a defined input off-grid-cluster-Layer
function addFunctionsToOGClusterLayer(layer){
layer.on("click", function(e) {
  console.log('click')
  this.clearHighlight();
  let properties = e.layer.properties;
  console.log(properties)
  if (properties.cluster_offgrid_id !== undefined) {
    var type = "c";
    var ID = properties.cluster_offgrid_id;
    var popup='\
      <table>\
        <tr><td align="right"><b>Area</b>:</td><td>'+parseFloat(properties.area_km2).toFixed(2)+' km2</td></tr>\
        <tr><td align="right"><b>Building Count</b>:</td><td>'+parseFloat(properties.building_count).toFixed(0)+'</td></tr>\
        <tr><td align="right"><b>Building Area in km²</b>:</td><td>'+parseFloat(properties.building_area_km2).toFixed(0)+'</td></tr>\
        <tr><td align="right"><b>Buildings per km²</b>:</td><td>'+parseFloat(properties.building_count_density_perkm2).toFixed(0)+'</td></tr>\
        <tr><td align="right"><b>Percentage Building Area</b>:</td><td>'+parseFloat(properties.percentage_building_area).toFixed(0)+'</td></tr>\
        <tr><td align="right"><b>Distance to Grid in km</b>:</td><td>'+parseFloat(properties.grid_dist_km).toFixed(0)+'</td></tr>\
      </table>';
  } else {
    var type = "r";
    var ID = "r" + properties.OBJECTID;
  }
  if (type != "r") {
  clusterInfo.remove();
  clusterInfo.update = function () {
    this._div.innerHTML = popup;
    this._div.innerHTML;
  };
  clusterInfo.addTo(map);
    this.highlight = ID;
    let style = clusterSelectionStyle;
    this.setFeatureStyle(ID, style);
    L.DomEvent.stop(e);
  }
  map.on("click", function() {
    clusterInfo.remove();
  });
  map.flyToBounds([[e.layer.properties.bb_south,e.layer.properties.bb_west],[e.layer.properties.bb_north,e.layer.properties.bb_east]])
  });
  layer.filter = function(filter) {
    let newhiddenIDs = [];
    let vt = this._vectorTiles;
    for (let vtkey in vt) {
        let f = vt[vtkey]._features;
        for (let fkey in f) {
            
            let prop = f[fkey].feature.properties;
            if (typeof prop.area_km2 !== 'undefined'){
                if (!(prop.area_km2 > filter.ogminarea && prop.area_km2 < filter.ogmaxarea && prop.grid_dist_km > filter.ogmindtg && prop.grid_dist_km < filter.ogmaxdtg)) {
                    newhiddenIDs.push(prop.cluster_offgrid_id);
                    if (this.hiddenIDs.indexOf(prop.cluster_offgrid_id) == -1){
                        this.setFeatureStyle(prop.cluster_offgrid_id, this.hiddenstyle);
                    }
                } else if (this.hiddenIDs.indexOf(prop.cluster_offgrid_id) > -1){
                    this.resetFeatureStyle(prop.cluster_offgrid_id);
                }
            }
        }
    }
    this.hiddenIDs = newhiddenIDs;
  };

  layer.on("load", function(e) {
    layer.filter(currentfilter);
  });
  layer.highlight = null;
  layer.hidden = null;
  layer.hiddenstyle = {
    fillColor: "lightgray",
    fillOpacity: 0.3,
    opacity: 0,
    fill: true,
    color: "lightgray"
  };
  layer.clearHidden = function() {
    if (this.hiddenIDs) {
        for (let i = 0, len = this.hiddenIDs.length; i < len; i++) {
            let id = this.hiddenIDs[i];
            this.resetFeatureStyle(id);
        }
    }
  };
  layer.clearHighlight = function() {
    if (this.highlight) {
        if (this.hiddenIDs && this.hiddenIDs.indexOf(this.highlight) > -1){
            this.setFeatureStyle(this.highlight, this.hiddenstyle);
        } else {
            this.resetFeatureStyle(this.highlight);
        }
    }
    this.highlight = null;
  };
  layer.on("load", function(e) {
    layer.filter(currentfilter);        
  });

  map.addEventListener("filterchange", function(filter) {
    layer.filter(currentfilter);
  });
  map.on("click", function() {
      layer.clearHighlight();
  });
}

function createNewOGClusterLayer(ogClusterString){
  var layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/" + ogClusterString + "/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    OGClusters: function(prop, zoom) {
      if (prop.cluster_offgrid_id > 0) {
        color = "red";
      } else {
        color = "lightgrey";
      }
      return(ogClustersStyle);
    },
  },
  maxZoom: 19,
  maxNativeZoom: 16,
  minZoom: 5,
  interactive: true,
  getFeatureId: function(f) {
    if (f.properties.cluster_offgrid_id !== undefined) {
      return f.properties.cluster_offgrid_id;
    }
    if (f.properties.osm_id !== undefined) {
      return "g" + f.properties.osm_id;
    }
    return "r" + f.properties.OBJECTID;
    }
  })
  addFunctionsToOGClusterLayer(layer);
  return(layer);
}

  var ogClusterLayerAbia = createNewOGClusterLayer("nesp2_state_offgrid_clusters_abia");
  var ogClusterLayerAdamawa = createNewOGClusterLayer("nesp2_state_offgrid_clusters_adamawa");
  var ogClusterLayerAkwaIbom = createNewOGClusterLayer("nesp2_state_offgrid_clusters_akwa_ibom");
  var ogClusterLayerAnambra = createNewOGClusterLayer("nesp2_state_offgrid_clusters_anambra");
  var ogClusterLayerBauchi = createNewOGClusterLayer("nesp2_state_offgrid_clusters_bauchi");
  var ogClusterLayerBayelsa = createNewOGClusterLayer("nesp2_state_offgrid_clusters_bayelsa");
  var ogClusterLayerBenue = createNewOGClusterLayer("nesp2_state_offgrid_clusters_benue");
  var ogClusterLayerBorno = createNewOGClusterLayer("nesp2_state_offgrid_clusters_borno");
  var ogClusterLayerCrossRiver = createNewOGClusterLayer("nesp2_state_offgrid_clusters_cross_river");
  var ogClusterLayerDelta = createNewOGClusterLayer("nesp2_state_offgrid_clusters_delta");
  var ogClusterLayerEbonyi = createNewOGClusterLayer("nesp2_state_offgrid_clusters_ebonyi");
  var ogClusterLayerEdo = createNewOGClusterLayer("nesp2_state_offgrid_clusters_edo");
  var ogClusterLayerEkiti = createNewOGClusterLayer("nesp2_state_offgrid_clusters_ekiti");
  var ogClusterLayerEnugu = createNewOGClusterLayer("nesp2_state_offgrid_clusters_enugu");
  var ogClusterLayerFederalCapitalTerritory = createNewOGClusterLayer("nesp2_state_offgrid_clusters_federal_capital_territory");
  var ogClusterLayerGombe = createNewOGClusterLayer("nesp2_state_offgrid_clusters_gombe");
  var ogClusterLayerImo = createNewOGClusterLayer("nesp2_state_offgrid_clusters_imo");
  var ogClusterLayerJigawa = createNewOGClusterLayer("nesp2_state_offgrid_clusters_jigawa");
  var ogClusterLayerKaduna = createNewOGClusterLayer("nesp2_state_offgrid_clusters_kaduna");
  var ogClusterLayerKano = createNewOGClusterLayer("nesp2_state_offgrid_clusters_kano");
  var ogClusterLayerKatsina = createNewOGClusterLayer("nesp2_state_offgrid_clusters_katsina");
  var ogClusterLayerKebbi = createNewOGClusterLayer("nesp2_state_offgrid_clusters_kebbi");
  var ogClusterLayerKogi = createNewOGClusterLayer("nesp2_state_offgrid_clusters_kogi");
  var ogClusterLayerKwara = createNewOGClusterLayer("nesp2_state_offgrid_clusters_kwara");
  var ogClusterLayerLagos = createNewOGClusterLayer("nesp2_state_offgrid_clusters_lagos");
  var ogClusterLayerNasarawa = createNewOGClusterLayer("nesp2_state_offgrid_clusters_nasarawa");
  var ogClusterLayerNiger = createNewOGClusterLayer("nesp2_state_offgrid_clusters_niger");
  var ogClusterLayerOgun = createNewOGClusterLayer("nesp2_state_offgrid_clusters_ogun");
  var ogClusterLayerOndo = createNewOGClusterLayer("nesp2_state_offgrid_clusters_ondo");
  var ogClusterLayerOsun = createNewOGClusterLayer("nesp2_state_offgrid_clusters_osun");
  var ogClusterLayerOyo = createNewOGClusterLayer("nesp2_state_offgrid_clusters_oyo");
  var ogClusterLayerPlateau = createNewOGClusterLayer("nesp2_state_offgrid_clusters_plateau");
  var ogClusterLayerRivers = createNewOGClusterLayer("nesp2_state_offgrid_clusters_rivers");
  var ogClusterLayerSokoto = createNewOGClusterLayer("nesp2_state_offgrid_clusters_sokoto");
  var ogClusterLayerTaraba = createNewOGClusterLayer("nesp2_state_offgrid_clusters_taraba");
  var ogClusterLayerYobe = createNewOGClusterLayer("nesp2_state_offgrid_clusters_yobe");
  var ogClusterLayerZamfara = createNewOGClusterLayer("nesp2_state_offgrid_clusters_zamfara");

var ogClusterLayers = {
  "Abia": ogClusterLayerAbia,
  "Adamawa": ogClusterLayerAdamawa,
  "Akwa Ibom": ogClusterLayerAkwaIbom,
  "Anambra": ogClusterLayerAnambra,
  "Bauchi": ogClusterLayerBauchi,
  "Bayelsa": ogClusterLayerBayelsa,
  "Benue": ogClusterLayerBenue,
  "Borno": ogClusterLayerBorno,
  "Cross River": ogClusterLayerCrossRiver,
  "Delta": ogClusterLayerDelta,
  "Ebonyi": ogClusterLayerEbonyi,
  "Edo": ogClusterLayerEdo,
  "Ekiti": ogClusterLayerEkiti,
  "Enugu": ogClusterLayerEnugu,
  "Federal Capital Territory": ogClusterLayerFederalCapitalTerritory,
  "Gombe": ogClusterLayerGombe,
  "Imo": ogClusterLayerImo,
  "Jigawa": ogClusterLayerJigawa,
  "Kaduna": ogClusterLayerKaduna,
  "Kano": ogClusterLayerKano,
  "Katsina": ogClusterLayerKatsina,
  "Kebbi": ogClusterLayerKebbi,
  "Kogi": ogClusterLayerKogi,
  "Kwara": ogClusterLayerKwara,
  "Lagos": ogClusterLayerLagos,
  "Nasarawa": ogClusterLayerNasarawa,
  "Niger": ogClusterLayerNiger,
  "Ogun": ogClusterLayerOgun,
  "Ondo": ogClusterLayerOndo,
  "Osun": ogClusterLayerOsun,
  "Oyo": ogClusterLayerOyo,
  "Plateau": ogClusterLayerPlateau,
  "Rivers": ogClusterLayerRivers,
  "Sokoto": ogClusterLayerSokoto,
  "Taraba": ogClusterLayerTaraba,
  "Yobe": ogClusterLayerYobe,
  "Zamfara": ogClusterLayerZamfara,
}
