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
  "hot": hot,
  "esri": esri,
  "OpenStreetMap": osm,
  "osm_gray": osm_gray,
  "national_background": national_background,
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
  position: 'bottomleft'
});

infoBox.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
  this.update();
  L.DomEvent.disableClickPropagation(this._div);
  return this._div;
};

infoBox.update = function(props) {
  this._div.innerHTML = '<h4 class="selection_detail_header">State Availability</h4>' +
    '<table class="selection_detail">' +
    '<tr><td align="right"><b>Grid Tracking</b>:</td><td>' + "aaa" + '</td></tr>' +
    '<tr><td align="right"><b>Remote Mapping</b>:</td><td>' + "bbb" + '</td></tr>' +
    '<tr><td align="right"><b>Field Surveys</b>:</td><td>' + "ccc" + '</td></tr>' +
    '</table>';
  this._div.innerHTML
};


var clusterInfo = L.control({
  position: 'bottomleft'
});

clusterInfo.onAdd = function(map) {
  this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
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
      state_button_fun(trigger="zoom");
    }
  }
})

map.on("contextmenu", function (e) {
var zoom = map.getZoom();
    console.log(e.latlng)
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
