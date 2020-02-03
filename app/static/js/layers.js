var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var hot = L.tileLayer("https://tile-{s}.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var esri = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
  maxZoom: 19,
  attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
});

var buildingDensity = L.tileLayer("https:tile.rl-institut.de/data/nesp2_building-density-heatmap/{z}/{x}/{y}.png", {
  maxZoom: 19,
  opacity: 0.5,
  attribution: '☮'
});

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
        fill: true,
        fillColor: col,
        fillOpacity: 0.3,
      }
    }
  }
});

function highlightFeature(e) {
  var tooltipContent = "<b>" + e.target.feature.properties.name + "</b> Availability:<br>";
  var avail = {
    gridTracking: "<b>✕</b>",
    remoteMapping: "<b>✕</b>",
    Surveying: "<b>✕</b>",
  }
  if (e.target.feature.properties.availability >= 4) {avail.gridTracking = "<b>✓</b>";}
  if (e.target.feature.properties.availability % 4 >= 2) {avail.remoteMapping = "<b>✓</b>";}
  if (e.target.feature.properties.availability % 2 === 1) {avail.Surveying = "<b>✓</b>";}
  tooltipContent = tooltipContent + "Grid Tracking: " + avail.gridTracking + "<br>";
  tooltipContent = tooltipContent + "Remote Mapping: " + avail.remoteMapping + "<br>";
  tooltipContent = tooltipContent + "Surveying: " + avail.Surveying + "<br>";
  highlightLayer = e.target;
  highlightLayer.setStyle(statesStyleGeojsonHighlight);
  highlightLayer.bindTooltip(tooltipContent);
  highlightLayer.openTooltip();
//  alert("jjj");
}

function lowlightFeature(e) {
  lowlightLayer = e.target;
  lowlightLayer.setStyle(statesStyleGeojsonTransparent);
  //highlightLayer.closePopup();
}

function highlight_state(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: lowlightFeature,
  });  
  layer.on('click',function() { 
    document.getElementById("stateSelect").value = feature.properties["name"];
  });
}      

var nigeria_states_geojson = L.geoJSON([nigeria_states_simplified], {
  style: function (feature) {
    return(statesStyleGeojsonTransparent);
  },
  onEachFeature: highlight_state,
});

nigeria_states_geojson.on("click", function (event) {
  map.options.maxZoom = 19;
  map.fitBounds(event.layer.getBounds());
  map.removeLayer(nigeria_states_geojson);
  state_button_fun();
});


var gridLayer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_grid-enugu/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    elevenkv: function(prop, zoom) {
      return gridStyle33kv
    },
    thirtythreekv: function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

var gridLayerJigawa = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid_jigawa/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '11_kV_jigawa': function(prop, zoom) {
      return gridStyle33kv
    },
    '33_kV_jigawa': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

var gridLayerKaduna = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid_kaduna/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '11_kV_kaduna': function(prop, zoom) {
      return gridStyle33kv
    },
    '33_kV_kaduna': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

var gridLayerKatsina = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid_katsina/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '11_kV_katsina': function(prop, zoom) {
      return gridStyle33kv
    },
    '33_kV_katsina': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

var gridLayerKebbi = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid_kebbi/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '11_kV_kebbi': function(prop, zoom) {
      return gridStyle33kv
    },
    '33_kV_kebbi': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

var gridLayerNasawara = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid_nasawara/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '11_kV_nasawara': function(prop, zoom) {
      return gridStyle33kv
    },
    '33_kV_nasawara': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

var gridLayerOsun = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid_osun/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '11_kV_osun': function(prop, zoom) {
      return gridStyle33kv
    },
    '33_kV_osun': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

var gridLayerSokoto = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid_sokoto/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '11_kV_sokoto': function(prop, zoom) {
      return gridStyle33kv
    },
    '33_kV_sokoto': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

var gridLayerZamfara = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_state_grid_zamfara/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    '11_kV_zamfara': function(prop, zoom) {
      return gridStyle33kv
    },
    '33_kV_zamfara': function(prop, zoom) {
      return gridStyle11kv
    },
  }
});

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
        <tr><td align="right"><b>Admin1</b>:</td><td>'+properties.admin1+'</td></tr>\
        <tr><td align="right"><b>Admin2</b>:</td><td>'+properties.admin2+'</td></tr>\
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
});
