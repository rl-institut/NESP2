const website_url = "http://se4allwebpage.westeurope.cloudapp.azure.com";


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
  maxNativeZoom: 17,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

// Basic png-tile taken from wmflabs
var osm_gray = L.tileLayer("https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy OpenStreetMap, <a href="https://wmflabs.org">wmflabs</a>.'
});

// Basic png-tile layer for background taken from tile server serves zoom levels 5-9
var national_background = L.tileLayer(tileserver + "nesp2_national_background/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: 'Background Tiles <a href="' + website_url +  '/about-map"> &copy se4all</a>'
});

// Basic png-tile layer for overlays taken from tile server serves zoom levels 5-9
var national_heatmap = L.tileLayer(tileserver + "nesp2_national_heatmap/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: 'Heatmap <a href="' + website_url +  '/about-map">© SE4ALL</a>'
});

// Basic png-tile layer for overlays taken from tile server serves zoom levels 5-9
var national_grid = L.tileLayer(tileserver + "nesp2_national_grid/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: 'Grid <a href="' + website_url +  '/about-map">© SE4ALL</a>'
});

// Basic png-tile layer combines national grid, heatmap and background. Redundant. Serves Levels 5-9
var welcome_view = L.tileLayer(tileserver + "nesp2_national_welcome-view/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: ''
});

var generation_assets_geojson = null;

var centroidsGroup = L.layerGroup().addTo(map);


function remove_layer(layer, msg=null) {
  if (map.hasLayer(layer) == true) {
    map.removeLayer(layer);
  }
  else{
    if (msg != null){
        console.log("Cannot remove unexisting layer");
        console.log(msg);
    }
  }
};

function add_layer(layer, msg=null) {
  if (map.hasLayer(layer) == false) {
    map.addLayer(layer);
  }
  else{
    if (msg != null){
        console.log("Cannot add already existing layer");
        console.log(msg);
    }
  }
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


// State borders and state hover functions
function highlightStateBorders(e) {
  var stateName = e.target.feature.properties.name;
  var tooltipContent = "<b>" + stateName + "</b> Availability:<br>";

  highlightLayer = e.target;
  if (stateName != selectedState) {
    highlightLayer.setStyle(statesStyleGeojsonHighlight);
  } else {
    highlightLayer.setStyle(statesStyleGeojsonTransparent);
  }
  // upate infoBox to the highlighted state
  update_infoBox(stateName, e.target.feature.properties.availability)
}

function lowlightStateBorders(e) {
  lowlightLayer = e.target;
  lowlightLayer.setStyle(statesStyleGeojsonTransparent);
  // update infoBox to the currently selectedState by default
  update_infoBox(selectedState)
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
      // Update the dropdown menu for state selection
      document.getElementById("stateSelect").value = selectedState;
      // Update the infoBox for the selected state
      update_infoBox(selectedState, feature.properties.availability, defineSelectedState = true)
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
    if(selectedState == feature.properties["name"]){
        update_infoBox(selectedState, feature.properties.availability, defineSelectedState = true)
    }
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

var nigeria_states_borders_geojson = L.geoJSON(nigeria_states_simplified, {
  style: function(feature) {
    return (SLstates);
  },
  filter: function(feature) {
    return (selectedState != feature.properties["name"])
  }
});

function update_nigeria_states_borders_geojson() {
    give_status("update nigeria border geojson")
    //remove the features
    nigeria_states_borders_geojson.clearLayers();
    //add the features which will trigger the filter
    nigeria_states_borders_geojson.addData(nigeria_states_simplified);
};

function zoomToSelectedState() {
    map.flyToBounds(selectedStateOptions.bounds, {maxZoom: 19, animate:false});
};

// Definitions and functions for the state_grid_layer

// Vector tiles layer that is adapted (URL) depending on the chosen state. Contains layers '11kV' and '33kV' Columns: several, but of no interest to the map

//Always Using the entire Grid
var state_grid_layer = L.vectorGrid.protobuf(tileserver + "nesp2_state_grid/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  maxZoom:15,
  attribution: 'Grid <a href="' + website_url +  '/about-map">© SE4ALL</a>',
  vectorTileLayerStyles: {
    '33_kV': function(prop, zoom) {
      return gridStyle33kv
    },
    '11_kV': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});



/* On and off grid generation layer */


// Geojson layer formed from local json file. Used for hovering styles and clicking. Columns: id, name, source, type, wikidata, wikipedia, availability (int)
var generation_assets_layer = L.geoJSON(null, {
  filter: function(feature) {
    return (feature.properties["capacity_kw"] >= currentfilter.mingen || feature.properties["capacity_kw"] <= currentfilter.maxgen)
  }
});

// Make use of the filter function of the geoJSON layer
function update_generation_assets_layer() {
    give_status("update generation_asset layer")
    //remove the features
    generation_assets_layer.clearLayers();
    //add the features which will trigger the filter
    generation_assets_layer.addData(generation_assets_geojson);
};


if(generation_assets_geojson == null){
    // this fetches the url described by the fetch_generation_assets() view in app/__init__.py
    $.get({
        url: "/generation_assets",
        success: function(data){
            generation_assets_geojson = data;
            update_generation_assets_layer();
        }
    });
};

// Adds functions for filters and styling to a defined input grid-cluster-Layer
/* normal settlements layer */
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
      // if selected cluster within list of filtered clusters, update info with number/length
      if (ID in all_centroids_dict){
        var filtered_centroids_keys = get_filtered_centroids_keys();
        const clusterNum = filtered_centroids_keys.indexOf(all_centroids_dict[ID]) + 1;
        set_currently_featured_centroid_id(all_centroids_dict[ID]);
        update_clusterInfo(properties, filtered_centroids_keys.length, clusterNum);
      }

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
    ],{animate:false})
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
          if (!(prop.area_km2 >= filter.minarea && 
                prop.area_km2 < filter.maxarea && 
                ((prop.grid_dist_km >= filter.mindtg && prop.grid_dist_km < filter.maxdtg ) || (filter.maxdtg == 50 && prop.grid_dist_km == null) )
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


/* normal settlements layer */
function createNewClusterLayer(clusterString) {
  var layer = L.vectorGrid.protobuf(tileserver + "nesp2_state_clusters_" + clusterString + "/{z}/{x}/{y}.pbf", {
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
    maxNativeZoom: 17,
    minZoom: 5,
    interactive: true,
    tolerance: 10,
    attribution: 'Settlements <a href="' + website_url +  '/about-map">© SE4ALL</a>',
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
/* remotely mapped settlements layer */
function addFunctionsToOGClusterLayer(layer) {

  layer.highlight = null;
  layer.hidden = null;
  layer.hiddenstyle = {
    fillColor: "grey",
    fillOpacity: 0.2,
    opacity: 0.2,
    fill: true,
    color: "grey"
  };


  map.addEventListener("ogfilterchange", function(filter_props) {
    layer.apply_filter(filter_props);
  });

  map.on("click", function() {
    layer.clearHighlight();
  });


  layer.on("mouseover", function(e){
    console.log("Hover properties")
    console.log(e.layer.properties)
  });

  layer.on("load", function(e) {
    layer.apply_filter(currentfilter);
  });

  layer.on("click", function(e) {
    // call function defined below
    this.clearHighlight();

    map.on("click", function() {
      clusterInfo.remove();
    });
    let properties = e.layer.properties;
    if (properties.cluster_offgrid_id !== undefined) {
      var ID = properties.cluster_offgrid_id;
      // Update clusterInfo based on the properties
      update_clusterInfo(properties, "?")
      this.highlight = ID;
      // the style is defined in this file
      this.setFeatureStyle(ID, ogClusterSelectionStyle);
      L.DomEvent.stop(e);

      var cluster_type = get_cluster_type();
      // if selected cluster within list of filtered clusters, update info with number/length
      if (ID in og_centroids_dict){
        var filtered_centroids_keys = get_filtered_centroids_keys();
        const clusterNum = filtered_centroids_keys.indexOf(og_centroids_dict[ID]) + 1;
        set_currently_featured_centroid_id(og_centroids_dict[ID]);
        update_clusterInfo(properties, filtered_centroids_keys.length, clusterNum);
      }
    }

    map.flyToBounds([
      [e.layer.properties.bb_south, e.layer.properties.bb_west],
      [e.layer.properties.bb_north, e.layer.properties.bb_east]
    ],{animate:false})
  });


  layer.apply_filter = function(filter) {
    let newhiddenIDs = [];
    let highlighted_IDs = [];

    let vt = this._vectorTiles;
    for (let vtkey in vt) {
      let f = vt[vtkey]._features;
      for (let fkey in f) {

        let prop = f[fkey].feature.properties;
        if (typeof prop.area_km2 !== 'undefined') {
          if (!(prop.area_km2 >= filter.ogminarea && prop.area_km2 <= filter.ogmaxarea && prop.grid_dist_km >= filter.ogmindtg && prop.grid_dist_km <=filter.ogmaxdtg && prop.building_count >= filter.ogminb && prop.building_count <=filter.ogmaxb && prop.percentage_building_area >= filter.ogminbfp && prop.percentage_building_area <=filter.ogmaxbfp)) {
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

  /* loop over the hidden clusters and display them again */
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
};

function createNewOGClusterLayer(ogClusterString) {
  var layer = L.vectorGrid.protobuf(tileserver + "nesp2_state_offgrid_clusters_" + ogClusterString + "/{z}/{x}/{y}.pbf", {
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
    maxNativeZoom: 19,
    minZoom: 5,
    interactive: true,
    tolerance: 10,
    attribution: 'Settlements <a href="' + website_url +  '/about-map">© SE4ALL</a>',
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

