map.addLayer(national_background);
map.addLayer(osm_gray);

// legend located at the lower right for datasets on national level
var legend = L.control({
  position: 'bottomright'
});
legend.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'legend-box map-legend'); // create a div with classes
  this.update();

  return this._div;
};
legend.update = function(props) {
  this._div.innerHTML = '<div class="grid-x"><div class="small-3 map-legend__text"><div class="legend-color-grid legend-color--green"></div></div><div class="small-9 map-legend__label"><p>Datasets available</p></div><div class="small-3 map-legend__text"><div class="legend-color-grid legend-color--gray"></div></div><div class="small-9 map-legend__label"><p>Datasets <span class="map-legend--highlight">not yet</span> available</p></div></div>'
};
legend.addTo(map);


// legend located at the lower right for grid on state and village level
var gridLegend = L.control({
  position: 'bottomright'
});

gridLegend.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'legend-box map-legend map-legend-grid'); // create a div with classes
  this.update();

  return this._div;
};

gridLegend.update = function(props) {
  this._div.innerHTML = '<div class="grid-x"><div class="small-3 map-legend__text"><div class="legend-color-grid legend-color--brown"></div></div><div class="small-9 map-legend__label">11 kV Grid</div><div class="small-3 map-legend__text"><div class="legend-color legend-color-grid legend-color--red"></div></div><div class="small-9 map-legend__label">33 kV Grid</div></div>'
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
    if(stateName != undefined) {
        var control_content =
          '<div class="grid-x info-box legend-box">' +
            '<div class="cell info-box__header">' +
              '<p class="selection_detail_header">' + stateName.toUpperCase() + '</p>' +
            '</div>' +
            '<div class="cell info-box__content">' +
              '<div class="grid-x">' +
                '<div class="cell small-9 info-box__item">Grid Tracking</div><div class="cell small-3 info-box__icon">' + avail.gridTracking + '</div>' +
                '<div class="cell small-9 info-box__item">Remote Mapping</div><div class="cell small-3 info-box__icon">' + avail.remoteMapping + '</div>' +
                '<div class="cell small-9 info-box__item">Field Surveys</div><div class="cell small-3 info-box__icon">' + avail.Surveying + '</div>' +
              '</div>' +
            '</div>' +
          '</div>';
    }
    if(defineSelectedState == true) {
        selectedStateInfoBoxContent = control_content;
    }
    if(stateName == selectedState) {
        control_content = selectedStateInfoBoxContent;
    }

    if(stateName == undefined) {
     control_content=
     '<div class="grid-x info-box legend-box">' +
        '<div class="cell info-box__header">' +
          '<p class="selection_detail_header selection_detail_header--light">SELECT A STATE</p>' +
        '</div>' +
        '<div class="cell info-box__content">' +
          '<div class="grid-x">' +
            '<div class="cell small-9 info-box__item">Grid Tracking</div><div class="cell small-3"></div>' +
            '<div class="cell small-9 info-box__item">Remote Mapping</div><div class="cell small-3"></div>' +
            '<div class="cell small-9 info-box__item">Field Surveys</div><div class="cell small-3"></div>' +
          '</div>' +
        '</div>' +
      '</div>';
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

// this function updates the content of the clusterInfo in a centralized way
function update_clusterInfo(properties, selectedClustersNum=0, clusterNum="?") {

    var control_content = ''

    var settlements_content = '<span>Click on a settlement</span>'

    if (properties == "all"){
        control_content =
          '<div class="grid-x browse-box__items">\
            <div class="browse-box--left">Area (km²):</div><div class="browse-box--right"></div>\
            <div class="browse-box--left">Distance to Grid (km):</div><div class="browse-box--right"></div>\
          </div>';
    }

    if(properties.cluster_all_id !== undefined){
        // all
        control_content =
          '<div class="grid-x browse-box__items">\
            <div class="browse-box--left">Area (km²):</div><div class="browse-box--right">' + parseFloat(properties.area_km2).toFixed(2) + '</div>\
            <div class="browse-box--left">Distance to Grid (km):</div><div class="browse-box--right">' + parseFloat(properties.grid_dist_km).toFixed(1) + '</div>\
          </div>';
          settlements_content = '<span>' + clusterNum + ' </span> of <span id="filtered-clusters-num">' + selectedClustersNum + '</span>'
    };

    if (properties == "og"){
        control_content =
        '<div class="grid-x browse-box__items">\
          <div class="browse-box--left">Area (km²):</div><div class="browse-box--right"></div>\
          <div class="browse-box--left">Building count:</div><div class="browse-box--right"></div>\
          <div class="browse-box--left">Built-up density (%):</div><div class="browse-box--right"></div>\
          <div class="browse-box--left">Distance to Grid (km):</div><div class="browse-box--right"></div>\
        </div>';
    };

    if (properties.cluster_offgrid_id !== undefined) {
    // og
        control_content =
        '<div class="grid-x browse-box__items">\
          <div class="browse-box--left">Area (km²):</div><div class="browse-box--right">' + parseFloat(properties.area_km2).toFixed(2) + '</div>\
          <div class="browse-box--left">Building count:</div><div class="browse-box--right">' + parseFloat(properties.building_count).toFixed(0) + '</div>\
          <div class="browse-box--left">Built-up density (%):</div><div class="browse-box--right">' +parseFloat(properties.percentage_building_area).toFixed(2) + '</div>\
          <div class="browse-box--left">Distance to Grid (km):</div><div class="browse-box--right">' + parseFloat(properties.grid_dist_km).toFixed(1) + '</div>\
        </div>';
        settlements_content = '<span>' + clusterNum + ' </span> of <span id="filtered-clusters-num">' + selectedClustersNum + '</span>'

    };

    control_content = '\
      <div class="grid-x browse-box legend-box">\
        <div class="cell browse-box__header">BROWSE THE SETTLEMENTS</div>\
        <div id="download_clusters" class="cell browse-box__btn consecutive__btn">\
          <div class="grid-x">\
            <a class="cell large-offset-1 large-2 btn--left" onclick="prev_selection_fun()">\
              <img class="state_info__img" src="../static/img/icons/i_arrow_left_g.svg">\
            </a>\
            <p class="cell large-6 browse-box__number">'
             + settlements_content +
            '</p>\
            <a class="cell large-2 btn--right" onclick="next_selection_fun()">\
              <img class="state_info__img" src="../static/img/icons/i_arrow_right_g.svg">\
            </a>\
          </div>\
        </div>'
       + control_content +
      '</div>';

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
