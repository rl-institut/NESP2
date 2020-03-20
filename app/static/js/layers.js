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

var centroidsGroup = L.layerGroup().addTo(map);

function remove_layer(layer) {
  if (map.hasLayer(layer) == true) {
    map.removeLayer(layer);
  }
};

function add_layer(layer) {
  if (map.hasLayer(layer) == false) {
    map.addLayer(layer);
  }
};

// Vector-tiles layer that has layer shapes and columns in its attribute table: id, name, source, type, wikidata, wikipedia, availability (int)
var statesLayer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_states/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    states: function(prop, zoom) {
      var col = "#ffff00";
      if (prop.availability === 7) {
        col = stateAvailabilityColor.green;
      }
      if (prop.availability === 6 || prop.availability === 5 || prop.availability === 3) {
        col = stateAvailabilityColor.yellow;
      }
      if (prop.availability === 4 || prop.availability === 2 || prop.availability === 1) {
        col = stateAvailabilityColor.orange;
      }
      if (prop.availability === 0) {
        col = stateAvailabilityColor.red;
      }
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
      if (prop.name == selectedState) {
        return (SLstateSelection)
      }
      return (SLstates)
    }
  },
  maxZoom: 19,
  maxNativeZoom: 14,
  minZoom: 5,
});


function redefine_selected_state_pbf() {
  selected_state_pbf = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_states/{z}/{x}/{y}.pbf", {
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      states: function(prop, zoom) {
        var col = "#ffff00";
        if (prop.name == selectedState) {
          return (SLstateSelection)
        }
        return (SLstates)
      }
    },
  maxZoom: 19,
  maxNativeZoom: 14,
  minZoom: 5,
  });
};

function update_selected_state_pbf() {
  remove_layer(selected_state_pbf);
  redefine_selected_state_pbf();
  add_layer(selected_state_pbf);
};

var notnigerialayer = L.vectorGrid.slicer(not_nigeria, {
    vectorTileLayerStyles: {
      'sliced': function(prop, zoom) {
      return notNigeriaStyle
      }
    },
  maxZoom: 19,
  minZoom: 5,
}).addTo(map);

// Vector-tiles layer that has LGA shapes in high resolution and columns in its attribute table: id, name, source, type, wikidata, wikipedia
var lgas_pbf = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_lgas_hr/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    lgas_hr: function(prop, zoom) {
      if (prop.name == selectedLGA) {
        return (NLlgaSelection)
      }
      return (NLlga)
    }
  }
});

function remove_lgas_pbf() {
  if (map.hasLayer(lgas_pbf) == true) {
    map.removeLayer(lgas_pbf);
  }
};

function add_lgas_pbf() {
  if (map.hasLayer(lgas_pbf) == false) {
    map.addLayer(lgas_pbf);
  }
};

function redefine_lgas_pbf() {
  lgas_pbf = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_lgas_hr/{z}/{x}/{y}.pbf", {
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      states: function(prop, zoom) {
        if (prop.name == selectedLGA) {
          return (NLlgaSelection)
        }
        return (NLlga)
      }
    }
  });
};

function update_lgas_pbf() {
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
  if (e.target.feature.properties.availability >= 4) {
    avail.gridTracking = "<b>✓</b>";
  }
  if (e.target.feature.properties.availability % 4 >= 2) {
    avail.remoteMapping = "<b>✓</b>";
  }
  if (e.target.feature.properties.availability % 2 === 1) {
    avail.Surveying = "<b>✓</b>";
  }
  highlightLayer = e.target;
  if (highlightLayer.feature.properties.name != selectedState) {
    highlightLayer.setStyle(statesStyleGeojsonHighlight);
  } else {
    highlightLayer.setStyle(statesStyleGeojsonTransparent);
  }
  infoBox.remove();

  infoBox.update = function(props) {
    this._div.innerHTML = '<h4 class="selection_detail_header">' + e.target.feature.properties.name + '</h4>' +
      '<table class="selection_detail">' +
      '<tr><td align="right"><b>Grid Tracking</b>:</td><td>' + avail.gridTracking + '</td></tr>' +
      '<tr><td align="right"><b>Remote Mapping</b>:</td><td>' + avail.remoteMapping + '</td></tr>' +
      '<tr><td align="right"><b>Field Surveys</b>:</td><td>' + avail.Surveying + '</td></tr>' +
      '</table>';
    this._div.innerHTML;
  };
  infoBox.addTo(map);
}

function lowlightStateBorders(e) {
  lowlightLayer = e.target;
  lowlightLayer.setStyle(statesStyleGeojsonTransparent);
  infoBox.remove();
}

function highlight_state(feature, layer) {
  layer.on({
    mouseover: highlightStateBorders,
    mouseout: lowlightStateBorders,
  });
  layer.on('click', function() {
    // Update the name of the selected state only if different from the currently selected
    if (selectedState != feature.properties["name"]) {
      prevState = selectedState;
      //update the selected state
      selectedState = feature.properties["name"];
      // Update the centroids layer to enable cluster click-through
      update_centroids_group();
      // Update the dropdown menu for state selection
      document.getElementById("stateSelect").value = selectedState;
      // Trigger the switch to state level
      state_button_fun(trigger="map-click");
    }
  });
}

// Geojson layer formed from local json file. Used for hovering styles and clicking. Columns: id, name, source, type, wikidata, wikipedia, availability (int)
var nigeria_states_geojson = L.geoJSON(nigeria_states_simplified, {
  style: function(feature) {
    return (statesStyleGeojsonTransparent);
  },
  onEachFeature: highlight_state,
  // Avoid adding the selected state, to not cover the clusters
  filter: function(feature) {
    return (selectedState != feature.properties["name"])
  }
});

// Make use of the filter function of the geoJSON layer
function update_nigeria_states_geojson() {
    give_status("update nigeria geojson")
    //remove the features
    nigeria_states_geojson.clearLayers();
    //add the features which will trigger the filter
    nigeria_states_geojson.addData(nigeria_states_simplified);
};

function updateSelectedStateBounds() {
      nigeria_states_geojson.eachLayer(function(layer) {
        if (layer.feature.properties.name == selectedState) {
          // save the bounds of the selected state for later uses
          selectedStateOptions.bounds = layer.getBounds();}
      })
};


function zoomToSelectedState() {
    map.flyToBounds(selectedStateOptions.bounds, {maxZoom: 19});
};

// Definitions and functions for the grid_layer

// Vector tiles layer that is adapted (URL) depending on the chosen state. Contains layers '11kV' and '33kV' Columns: several, but of no interest to the map
//var grid_layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/" + gridLayers[selectedState] + "/{z}/{x}/{y}.pbf", {

//Always Using the entire Grid
var grid_layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '33_kV': function(prop, zoom) {
      return gridStyle33kv
    },
    '11_kV': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

// Assign the selected state grid tile to the grid_layer
function redefine_grid_layer() {
// Vector tiles layer that is adapted (URL) depending on the chosen state. Contains layers '11kV' and '33kV' Columns: several, but of no interest to the map
//  grid_layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/" + gridLayers[selectedState] + "/{z}/{x}/{y}.pbf", {

//Always Using the entire Grid
  grid_layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid/{z}/{x}/{y}.pbf", {
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      '33_kV': function(prop, zoom) {
        return gridStyle33kv
      },
      '11_kV': function(prop, zoom) {
        return gridStyle11kv
      },
    }
  });
};

// Update the state level grid layer with tiles
function update_grid_layer() {
  //remove_layer(grid_layer);
  //redefine_grid_layer();
  // Add the grid layer depending on grid checkbox value
  grid_cb_fun();
};

// Adds functions for filters and styling to a defined input grid-cluster-Layer
function addFunctionsToClusterLayer(layer) {
  layer.on("click", function(e) {
    this.clearHighlight();
    let properties = e.layer.properties;
    if (properties.cluster_all_id !== undefined) {
      var type = "c";
      var ID = properties.cluster_all_id;
    } else {
      var type = "r";
      var ID = "r" + properties.OBJECTID;
    }
    if (type != "r") {
      // Update clusterInfo based on the properties
      update_clusterInfo(properties, "?")
      this.highlight = ID;
      let style = clusterSelectionStyle;
      this.setFeatureStyle(ID, style);
      L.DomEvent.stop(e);
    }
    map.on("click", function() {
      clusterInfo.remove();
    });
    map.flyToBounds([
      [e.layer.properties.bb_south, e.layer.properties.bb_west],
      [e.layer.properties.bb_north, e.layer.properties.bb_east]
    ])
  });
  layer.filter = function(filter) {
    let newhiddenIDs = [];
    let vt = this._vectorTiles;
    for (let vtkey in vt) {
      let f = vt[vtkey]._features;
      for (let fkey in f) {

        let prop = f[fkey].feature.properties;
        if (typeof prop.area_km2 !== 'undefined') {
          // check if numbers are filtered correctly
          //if (prop.grid_dist_km == null){alert("NULLAROO!");}
          if (!(prop.area_km2 > filter.minarea && 
                prop.area_km2 < filter.maxarea && 
                ((prop.grid_dist_km > filter.mindtg && prop.grid_dist_km < filter.maxdtg ) || (filter.maxdtg == 50 && prop.grid_dist_km == null) )
             )) {
            newhiddenIDs.push(prop.cluster_all_id);
            if (this.hiddenIDs.indexOf(prop.cluster_all_id) == -1) {
              this.setFeatureStyle(prop.cluster_all_id, this.hiddenstyle);
            }
          } else if (this.hiddenIDs.indexOf(prop.cluster_all_id) > -1) {
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
      if (this.hiddenIDs && this.hiddenIDs.indexOf(this.highlight) > -1) {
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

function createNewClusterLayer(clusterString) {
  var layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_clusters_" + clusterString + "/{z}/{x}/{y}.pbf", {
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      regions: function(prop, zoom) {
        if (prop.cluster_all_id > 0) {
          color = "red";
        } else {
          color = "lightgrey";
        }
        return (clustersStyle);
      },
    },
    maxZoom: 19,
    maxNativeZoom: 16,
    minZoom: 5,
    interactive: true,
    tolerance: 10,
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
  layer.state_name = snake_to_title(clusterString);
  addFunctionsToClusterLayer(layer);
  return (layer);
}

// Definitions and functions for the clusters_layer
// Vector tiles layer with clusters (populated areas). Contains layers 'regions' and 'kedco_lines'. regions-columns: admin1, admin2, area_km2, pop_hrsl
var clusterLayer = {}
statesList.forEach(function(item){
    clusterLayer[item] = createNewClusterLayer(title_to_snake(item));
});


// Adds functions for filters and styling to a defined input off-grid-cluster-Layer
function addFunctionsToOGClusterLayer(layer) {
  layer.on("click", function(e) {
    this.clearHighlight();
    let properties = e.layer.properties;
    if (properties.cluster_offgrid_id !== undefined) {
      var type = "c";
      var ID = properties.cluster_offgrid_id;
    } else {
      var type = "r";
      var ID = "r" + properties.OBJECTID;
    }
    if (type != "r") {
      // Update clusterInfo based on the properties
      update_clusterInfo(properties, "?")
      this.highlight = ID;
      let style = ogClusterSelectionStyle;
      this.setFeatureStyle(ID, style);
      L.DomEvent.stop(e);
    }
    map.on("click", function() {
      clusterInfo.remove();
    });
    map.flyToBounds([
      [e.layer.properties.bb_south, e.layer.properties.bb_west],
      [e.layer.properties.bb_north, e.layer.properties.bb_east]
    ])
  });
  layer.filter = function(filter) {
    let newhiddenIDs = [];
    let vt = this._vectorTiles;
    for (let vtkey in vt) {
      let f = vt[vtkey]._features;
      for (let fkey in f) {

        let prop = f[fkey].feature.properties;
        if (typeof prop.area_km2 !== 'undefined') {
          if (!(prop.area_km2 > filter.ogminarea && prop.area_km2 < filter.ogmaxarea && prop.grid_dist_km > filter.ogmindtg && prop.grid_dist_km < filter.ogmaxdtg && prop.building_count > filter.ogminb && prop.building_count < filter.ogmaxb && prop.percentage_building_area > filter.ogminbfp && prop.percentage_building_area < filter.ogmaxbfp)) {
            newhiddenIDs.push(prop.cluster_offgrid_id);
            if (this.hiddenIDs.indexOf(prop.cluster_offgrid_id) == -1) {
              this.setFeatureStyle(prop.cluster_offgrid_id, this.hiddenstyle);
            }
          } else if (this.hiddenIDs.indexOf(prop.cluster_offgrid_id) > -1) {
            this.resetFeatureStyle(prop.cluster_offgrid_id);
          }
        }
      }
    }
    this.hiddenIDs = newhiddenIDs;
  };

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
      if (this.hiddenIDs && this.hiddenIDs.indexOf(this.highlight) > -1) {
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

  map.addEventListener("ogfilterchange", function(filter) {
    layer.filter(currentfilter);
  });
  map.on("click", function() {
    layer.clearHighlight();
  });
}

function createNewOGClusterLayer(ogClusterString) {
  var layer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_offgrid_clusters_" + ogClusterString + "/{z}/{x}/{y}.pbf", {
    rendererFactory: L.canvas.tile,
    vectorTileLayerStyles: {
      OGClusters: function(prop, zoom) {
        if (prop.cluster_offgrid_id > 0) {
          color = "red";
        } else {
          color = "lightgrey";
        }
        return (ogClustersStyle);
      },
    },
    maxZoom: 19,
    maxNativeZoom: 16,
    minZoom: 5,
    interactive: true,
    tolerance: 10,
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
  layer.state_name = snake_to_title(ogClusterString);
  addFunctionsToOGClusterLayer(layer);
  return (layer);
}


// Store the cluster layer for each state into an object
var ogClusterLayers = {}
statesList.forEach(function(item){
    ogClusterLayers[item] = createNewOGClusterLayer(title_to_snake(item));
});

