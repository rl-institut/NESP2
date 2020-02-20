var options = {
  center: [9, 7],
  zoomSnap: 0.5,
  zoom: 6.6,
  minZoom: 6,
  maxZoom: 19,
  zoomControl: false,
  maxBounds: [
    [2, 17], // S, E
    [15, 0]  // N, W
  ]
};

var map = L.map("map", options);
map.addLayer(national_background);
map.addLayer(osm_gray);

var legend = L.control({position: 'bottomright'});

legend.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'map-legend'); // create a div with a class "map-legend"
    this.update();

    return this._div;
};

legend.update = function (props) {
    this._div.innerHTML = '<div class="grid-x"><div class="small-3 map-legend__text"><div class="legend-color legend-color--green"></div></div><div class="small-9">Datasets available</div><div class="small-3 map-legend__text"><div class="legend-color legend-color--gray"></div></div><div class="small-9">Datasets <span class="map-legend--highlight">not yet</span> available</div></div>'
};

legend.addTo(map);


var baseMaps = {
  "hot" : hot,
  "esri" : esri,
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

L.control.scale({
    position: "bottomright"
}).addTo(map);

var info = L.control({position: 'bottomleft'});

            info.onAdd = function (map) {
                this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
                this.update();
                L.DomEvent.disableClickPropagation(this._div);
                return this._div;
            };

            info.update = function (props) {
                this._div.innerHTML = '<h4 class="selection_detail_header">State Availability</h4>' +
                                      '<table class="selection_detail">' +
                                      '<tr><td align="right"><b>Grid Tracking</b>:</td><td>' + "aaa" + '</td></tr>' +
                                      '<tr><td align="right"><b>Remote Mapping</b>:</td><td>'+"bbb"+'</td></tr>' +
                                      '<tr><td align="right"><b>Surveying</b>:</td><td>'+"ccc"+'</td></tr>' +
                                      '</table>';
                this._div.innerHTML
            };

        vecTileLayer.highlight = null;
        vecTileLayer.hidden = null;
        vecTileLayer.hiddenstyle = {
            fillColor: "lightgray",
            fillOpacity: 0.3,
            opacity: 0,
            fill: true,
            color: "lightgray"
        };
        vecTileLayer.clearHidden = function() {
            if (this.hiddenIDs) {
                for (let i = 0, len = this.hiddenIDs.length; i < len; i++) {
                    let id = this.hiddenIDs[i];
                    this.resetFeatureStyle(id);
                }
            }
        };
        vecTileLayer.clearHighlight = function() {
            if (this.highlight) {
                if (this.hiddenIDs && this.hiddenIDs.indexOf(this.highlight) > -1){
                    this.setFeatureStyle(this.highlight, this.hiddenstyle);
                } else {
                    this.resetFeatureStyle(this.highlight);
                }
            }
            this.highlight = null;
        };

        //map.addLayer(vecTileLayer);
        //map.addLayer(statesLayer);

        map.on("click", function() {
            vecTileLayer.clearHighlight();
        });
        map.on("popupclose", function() {
            vecTileLayer.clearHighlight();
        });


        // const AREA = 0,POP = 1,LONG = 3,LAT = 4,INFO = 5;
        currentfilter = {
            minarea: 0.001,
            maxarea: 10,
            minpop: 1,
            maxpop: 1000000,
        };

        vecTileLayer.filter = function(filter) {
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

        map.addEventListener("filterchange", function(filter) {
            vecTileLayer.filter(currentfilter);
        });

        vecTileLayer.on("load", function(e) {
            vecTileLayer.filter(currentfilter);
        });
        let logFormat = function(decimals){
            return wNumb({
                decimals: decimals,
                thousand: ",",
                encoder: function(val){
                    return Math.pow(10,val);
                },
                decoder: function(val){
                    return Math.log10(val);
                }
            })
        };

        let overlayMaps = {
            // "Priority Clusters": markers
        };
        L.control.layers(baseMaps, overlayMaps).addTo(map);
        map.on("layeradd",function (){
          vecTileLayer.bringToFront(); 
          national_heatmap.bringToFront();
          national_grid.bringToFront();
          national_background.bringToBack(); 
          esri.bringToBack(); 
          hot.bringToBack(); 
          osm.bringToBack(); 
          osm_gray.bringToBack();});
        map.fireEvent("filterchange", currentfilter);

        national_button_fun();

        map.on("click", function() {
            vecTileLayer.clearHighlight();
        });
        map.on("popupclose", function() {
            vecTileLayer.clearHighlight();
        });
