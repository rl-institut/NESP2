var options = {
  center: [9, 7],
  zoom: 6,
  minZoom: 6,
  maxZoom: 15,
  zoomControl: false,
  maxBounds: [
    [2, 15],
    [14, 0]
  ]
};

var map = L.map("map", options);
map.addLayer(osm);

var baseMaps = {
  "OpenStreetMap": osm,
  "esri" : esri,
};

L.control.zoom({
    position: "topright"
}).addTo(map);

L.control.scale({
    position: "bottomright"
}).addTo(map);

national_button_fun()

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
        let currentfilter = {
            minarea: 0.001,
            maxarea: 100,
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
        map.on("layeradd",function (){vecTileLayer.bringToFront(); esri.bringToBack(); osm.bringToBack();});
        map.fireEvent("filterchange", currentfilter);
