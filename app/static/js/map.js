map.addLayer(national_background);
map.addLayer(osm_gray);

var legend = L.control({
  position: 'bottomright'
});

legend.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'map-legend'); // create a div with a class "map-legend"
  this.update();

  return this._div;
};

legend.update = function(props) {
  this._div.innerHTML = '<div class="grid-x"><div class="small-3 map-legend__text"><div class="legend-color legend-color--green"></div></div><div class="small-9 map-legend__label"><p>Datasets available</p></div><div class="small-3 map-legend__text"><div class="legend-color legend-color--gray"></div></div><div class="small-9 map-legend__label"><p>Datasets <span class="map-legend--highlight">not yet</span> available</p></div></div>'
};

legend.addTo(map);

var gridLegend = L.control({
  position: 'bottomright'
});

gridLegend.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'map-legend map-legend-grid'); // create a div with a class "map-legend"
  this.update();

  return this._div;
};

gridLegend.update = function(props) {
  this._div.innerHTML = '<div class="grid-x"><div class="small-3 map-legend__text"><div class="legend-color-grid legend-color--brown"></div></div><div class="small-9">11kV Grid</div><div class="small-3 map-legend__text"><div class="legend-color legend-color-grid legend-color--red"></div></div><div class="small-9">33kV Grid</div></div>'
};

var baseMaps = {
  "Humanitarian OSM": hot,
  "esri": esri,
};

function remove_basemaps() {
  remove_layer(hot);
  remove_layer(esri);
  remove_layer(osm);
  remove_layer(osm_gray);
  remove_layer(national_background);
};

function remove_basemaps_except_osm_gray() {
  remove_layer(esri);
  remove_layer(osm);
  remove_layer(hot);
  remove_layer(national_background);
};

L.control.zoom({
  position: "topright"
}).addTo(map);

var infoBox = L.control({
  position: 'topleft'
});

infoBox.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  L.DomEvent.disableClickPropagation(this._div);
  return this._div;
};

selectedStateInfoBoxContent = null;

// this function updates the content of the clusterInfo in a centralized way
function update_infoBox(stateName=null, availability=0, defineSelectedState=false) {

    // show the availability of grid, remote mapping and surveying data for the state
    var avail = {
        gridTracking: '<img class="state_info__img" src="../static/img/icons/i_cross_square.svg">',
        remoteMapping: '<img class="state_info__img" src="../static/img/icons/i_cross_square.svg">',
        Surveying: '<img class="state_info__img" src="../static/img/icons/i_cross_square.svg">',
    }
    if (availability >= 4) {
        avail.gridTracking = '<img class="state_info__img" src="../static/img/icons/i_tick_square.svg">'
    }
    if (availability % 4 >= 2) {
        avail.remoteMapping = '<img class="state_info__img" src="../static/img/icons/i_tick_square.svg">'
    }
    if (availability % 2 === 1) {
        avail.Surveying = '<img class="state_info__img" src="../static/img/icons/i_tick_square.svg">'
    }

    var control_content = 
      '<div class="grid-x legend-box">' +
        '<div class="cell legend-box__header">' +
          '<p class="selection_detail_header">' + stateName + '</p>' +
        '</div>' +
        '<div class="cell legend-box__content">' +
          '<div class="grid-x">' +
            '<div class="cell small-9 legend-box__item">Grid Tracking</div><div class="cell small-3 legend-box__icon">' + avail.gridTracking + '</div>' +
            '<div class="cell small-9 legend-box__item">Remote Mapping</div><div class="cell small-3 legend-box__icon">' + avail.remoteMapping + '</div>' +
            '<div class="cell small-9 legend-box__item">Field Surveys</div><div class="cell small-3 legend-box__icon">' + avail.Surveying + '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
    if(defineSelectedState == true) {
        selectedStateInfoBoxContent = control_content;
    }
    if(stateName == selectedState) {
        control_content = selectedStateInfoBoxContent;
    }

    if(stateName == undefined) {
     control_content='<h4 class="selection_detail_header"> SELECT A STATE </h4>' +
      '<table class="selection_detail">' +
      '<tr><td align="right"><b>Grid Tracking</b>:</td><td></td></tr>' +
      '<tr><td align="right"><b>Remote Mapping</b>:</td><td></td></tr>' +
      '<tr><td align="right"><b>Field Surveys</b>:</td><td></td></tr>' +
      '</table>';
      selectedStateInfoBoxContent = control_content;
    }

    infoBox.remove();
    infoBox.update = function() {
        this._div.innerHTML = control_content;
    };
    // the addTo function will trigger the update() function
    infoBox.addTo(map);
};


var clusterInfo = L.control({
  position: 'bottomleft'
});

clusterInfo.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'cluster__info'); // create a div with a class "info"
  this.update();
  L.DomEvent.disableClickPropagation(this._div);
  return this._div;
};

clusterInfo.update = function(props) {
  this._div.innerHTML = '<h4 class="selection_detail_header">State Availability</h4>' +
    '<table class="selection_detail">' +
    '<tr><td align="right"><b>Grid Tracking</b>:</td><td>' + "aaa" + '</td></tr>' +
    '<tr><td align="right"><b>Remote Mapping</b>:</td><td>' + "bbb" + '</td></tr>' +
    '<tr><td align="right"><b>Field Surveys</b>:</td><td>' + "ccc" + '</td></tr>' +
    '</table>';
  this._div.innerHTML
};

// this function updates the content of the clusterInfo in a centralized way
function update_clusterInfo(properties, selectedClustersNum, clusterNum="?") {

    var control_content = '\
      <div class="grid-x ">\
          <h4 title="this is not the final style" class="cell"> Browse the settlements</h4>\
          <div id="download_clusters" class="cell  grid-x consecutive__btn">\
            <button class="cell large-3" style="float:left" onclick="prev_selection_fun()"> < </button> \
            <h5 class="cell large-6">\
                <span>' + clusterNum + ' </span> / <span id="filtered-clusters-num">\
                ' + selectedClustersNum + '</span> \
            </h5>\
            <button class="cell large-3" style="float:right" onclick="next_selection_fun()"> > </button>\
          </div>\
      </div>';

    if(properties.cluster_all_id !== undefined){
        // all
        control_content = control_content +
          '<table>\
            <tr><td align="right"><b>ID</b>:</td><td>' + properties.cluster_all_id + '</td></tr>\
            <tr><td align="right"><b>Area</b>:</td><td>' + properties.area_km2 + '</td></tr>\
            <tr><td align="right"><b>Distance to Grid</b>:</td><td>' + parseFloat(properties.grid_dist_km).toFixed(2) + ' km2</td></tr>\
          </table>';

          randomClusterInfo.remove();
    };

    if (properties.cluster_offgrid_id !== undefined) {
    // og
        control_content = control_content +
          '<table>\
            <tr><td align="right"><b>Area in km²</b>:</td><td>' + parseFloat(properties.area_km2).toFixed(2) + '</td></tr>\
            <tr><td align="right"><b>Distance to Grid in km</b>:</td><td>' + parseFloat(properties.grid_dist_km).toFixed(1) + '</td></tr>\
            <tr><td align="right"><b>Buildings</b>:</td><td>' + parseFloat(properties.building_count).toFixed(0) + '</td></tr>\
            <tr><td align="right"><b>Building Density</b>:</td><td>' + parseFloat(properties.percentage_building_area).toFixed(2) + '</td></tr>\
          </table>';

          randomClusterInfo.remove();
    };

    clusterInfo.remove();
    if(level != "national") {
        clusterInfo.update = function() {
            this._div.innerHTML = control_content;
        };
    }
    else{
        clusterInfo.update = function() {
            this._div.innerHTML = "";
        };
    }
    // the addTo function will trigger the update() function
    clusterInfo.addTo(map);
};


var randomClusterInfo = L.control({
  position: 'bottomleft'
});

randomClusterInfo.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  L.DomEvent.disableClickPropagation(this._div);
  return this._div;
};

map.on("zoom", function(e) {
  // change level between village and state depending on the zoom
  var zoom = map.getZoom();
  var zoom_threshold = 13;
  if (level == "state") {
    if (zoom >= zoom_threshold) {
      village_button_fun(trigger="zoom");
    }
  }
  if (level == "village") {
    if (zoom < zoom_threshold) {
        if (random_cluster == true) {
            state_button_fun(trigger="random-cluster");
        }
        else {
            // Don't change to state level if just flying to next village
            if (flying_to_next_cluster == false) {
                state_button_fun(trigger="zoom");
            }
        }
    }
  }
})

map.on("contextmenu", function (e) {
    console.log(map.getZoom());
    console.log(e.latlng);
});

let logFormat = function(decimals) {
  return wNumb({
    decimals: decimals,
    thousand: ",",
    encoder: function(val) {
      return Math.pow(10, val);
    },
    decoder: function(val) {
      return Math.log10(val);
    }
  })
};

let overlayMaps = {
  // "Priority Clusters": markers
};
L.control.layers(baseMaps, overlayMaps).addTo(map);
map.on("layeradd", function() {
  //vecTileLayer.bringToFront();
  national_heatmap.bringToFront();
  national_grid.bringToFront();
  //selected_state_pbf.bringToFront();
  national_background.bringToBack();
  esri.bringToBack();
  hot.bringToBack();
  osm.bringToBack();
  osm_gray.bringToBack();
});
map.fireEvent("filterchange", currentfilter);
map.fireEvent("ogfilterchange", currentfilter);

L.control.scale({
  position: "topright"
}).addTo(map);

// spinning wheel when loading layers
L.Control.loading({
    position: "topright"
}).addTo(map);

national_button_fun(trigger="init");
