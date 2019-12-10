var osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

var statesLayer = L.vectorGrid.protobuf("https://tile.rl-institut.de/data/nesp2_states/{z}/{x}/{y}.pbf", {
  rendererFactory: L.canvas.tile,
  vectorTileLayerStyles: {
    states: function(prop, zoom) {
      return statesStyle
    }
  }
})

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
  maxZoom: 15,
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