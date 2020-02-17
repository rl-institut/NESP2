var options = {
  center: [9, 7],
  zoom: 6,
  minZoom: 6,
  maxZoom: 19,
  zoomControl: false,
  maxBounds: [
    [2, 15],
    [14, 0]
  ]
};

var map = L.map("map", options);
map.addLayer(national_background);

var baseMaps = {
  "hot" : hot,
  "esri" : esri,
  "OpenStreetMap": osm,
  "mapbox": mapbox,
  "national_background": national_background,
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

//national_button_fun();

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

        ogclustersTileLayer.highlight = null;
        ogclustersTileLayer.hidden = null;
        ogclustersTileLayer.hiddenstyle = {
            fillColor: "lightgray",
            fillOpacity: 0.3,
            opacity: 0,
            fill: true,
            color: "lightgray"
        };
        ogclustersTileLayer.clearHidden = function() {
            if (this.hiddenIDs) {
                for (let i = 0, len = this.hiddenIDs.length; i < len; i++) {
                    let id = this.hiddenIDs[i];
                    this.resetFeatureStyle(id);
                }
            }
        };
        ogclustersTileLayer.clearHighlight = function() {
            if (this.highlight) {
                if (this.hiddenIDs && this.hiddenIDs.indexOf(this.highlight) > -1){
                    this.setFeatureStyle(this.highlight, this.hiddenstyle);
                } else {
                    this.resetFeatureStyle(this.highlight);
                }
            }
            this.highlight = null;
        };

        //map.addLayer(ogclustersTileLayer);
        //map.addLayer(statesLayer);

        map.on("click", function() {
            ogclustersTileLayer.clearHighlight();
        });
        map.on("popupclose", function() {
            ogclustersTileLayer.clearHighlight();
        });

        // const AREA = 0,POP = 1,LONG = 3,LAT = 4,INFO = 5;
        let currentfilter = {
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
                        if (!(prop.area_km2 > filter.minarea && prop.area_km2 < filter.maxarea && prop.pop_hrsl > filter.minpop && prop.pop_hrsl < filter.maxpop)) {
                            newhiddenIDs.push(prop.FID);
                            if (this.hiddenIDs.indexOf(prop.FID) == -1){
                                this.setFeatureStyle(prop.FID, this.hiddenstyle);
                            }
                        } else if (this.hiddenIDs.indexOf(prop.FID) > -1){
                            this.resetFeatureStyle(prop.FID);
                        }
                    }
                }
            }
            this.hiddenIDs = newhiddenIDs;
        };

        map.addEventListener("filterchange", function(filter) {
            vecTileLayer.filter(currentfilter);
            // markers.filter(currentfilter, map);
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
        map.on("layeradd",function (){vecTileLayer.bringToFront(); national_background.bringToBack(); esri.bringToBack(); hot.bringToBack(); osm.bringToBack(); mapbox.bringToBack();});
        map.fireEvent("filterchange", currentfilter);



        //map.addLayer(vecTileLayer);
        map.on("click", function() {
            vecTileLayer.clearHighlight();
        });
        map.on("popupclose", function() {
            vecTileLayer.clearHighlight();
        });
