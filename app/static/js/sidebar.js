//define the maxBounds which are visible for the map
var southWest = L.latLng(0.0334, 17.602),
    northEast = L.latLng(21.484, -5.298),
    maxBoundsDefault = L.latLngBounds(southWest, northEast);

var options = {
  center: [9, 7],
  zoomSnap: 0.5,
  zoom: 7,
  minZoom: 7,
  maxZoom: 19,
  zoomControl: false,
  maxBounds: maxBoundsDefault
};
var map = L.map("map", options);
var tileserver = "http://se4allwebpage.westeurope.cloudapp.azure.com:8080/data/"
var level = "national";
var previous_level = level;
var statesList = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];
var selectedState = "init";
var prevState = selectedState;
var selectedStateOptions = {bounds: null};
var filteredClusters = 0;
var filteredOgClusters = 0;
var selectedLGA = "";
var thirtythreeKV = "33_kV_" + selectedState.toLowerCase();
var centroids_layer_id = -1;
var browse_centroids_keys = [];
var og_centroids_dict = {};
var all_centroids_dict = {};
var centroids_layer_ids = {};
var current_cluster_centroids = Object();
var currently_featured_centroid_id = 0;
var currently_flying_to_cluster = false;
var downloadingClusters = false;
var statesWithOgClusters = [];
var ogClustersAvailability = false;
var currentfilter = {
  minarea: 0.1,
  maxarea: 10,
  mindtg: 0,
  maxdtg: 50,
  ogminarea: 0.05,
  ogmaxarea: 10,
  ogmindtg: 0,
  ogmaxdtg: 100,
  ogminb: 0,
  ogmaxb: 5000,
  ogminbfp: 0,
  ogmaxbfp: 100,
  filterID: ""
};
var gridLayers = {
  "Abia": "",
  "Adamawa": "",
  "Akwa Ibom": "",
  "Anambra": "",
  "Bauchi": "",
  "Bayelsa": "",
  "Benue": "",
  "Borno": "",
  "Cross River": "",
  "Delta": "",
  "Ebonyi": "",
  "Edo": "",
  "Ekiti": "",
  "Enugu": "nesp2_state_grid_enugu",
  "Federal Capital Territory": "",
  "Gombe": "",
  "Imo": "",
  "Jigawa": "nesp2_state_grid_jigawa",
  "Kaduna": "nesp2_state_grid_kaduna",
  "Kano": "nesp2_state_grid_kano",
  "Katsina": "nesp2_state_grid_katsina",
  "Kebbi": "nesp2_state_grid_kebbi",
  "Kogi": "",
  "Kwara": "",
  "Lagos": "",
  "Nasarawa": "nesp2_state_grid_nasarawa",
  "Niger": "",
  "Ogun": "",
  "Ondo": "",
  "Osun": "nesp2_state_grid_osun",
  "Oyo": "",
  "Plateau": "",
  "Rivers": "",
  "Sokoto": "nesp2_state_grid_sokoto",
  "Taraba": "",
  "Yobe": "",
  "Zamfara": "nesp2_state_grid_zamfara",
};

var OGClusterLayers = {
  "Abia": "nesp2_state_offgrid_clusters_abia",
  "Adamawa": "",
  "Akwa Ibom": "",
  "Anambra": "nesp2_state_offgrid_clusters_anambra",
  "Bauchi": "nesp2_state_offgrid_clusters_bauchi",
  "Bayelsa": "",
  "Benue": "nesp2_state_offgrid_clusters_benue",
  "Borno": "",
  "Cross River": "",
  "Delta": "nesp2_state_offgrid_clusters_delta",
  "Ebonyi": "",
  "Edo": "nesp2_state_offgrid_clusters_edo",
  "Ekiti": "nesp2_state_offgrid_clusters_ekiti",
  "Enugu": "nesp2_state_offgrid_clusters_enugu",
  "Federal Capital Territory": "nesp2_state_offgrid_clusters_federal_capital_territory",
  "Gombe": "",
  "Imo": "",
  "Jigawa": "nesp2_state_offgrid_clusters_jigawa",
  "Kaduna": "nesp2_state_offgrid_clusters_kaduna",
  "Kano": "nesp2_state_offgrid_clusters_kano",
  "Katsina": "nesp2_state_offgrid_clusters_katsina",
  "Kebbi": "nesp2_state_offgrid_clusters_kebbi",
  "Kogi": "nesp2_state_offgrid_clusters_kogi",
  "Kwara": "nesp2_state_offgrid_clusters_kwara",
  "Lagos": "",
  "Nasarawa": "nesp2_state_offgrid_clusters_nasarawa",
  "Niger": "nesp2_state_offgrid_clusters_niger",
  "Ogun": "nesp2_state_offgrid_clusters_ogun",
  "Ondo": "nesp2_state_offgrid_clusters_ondo",
  "Osun": "nesp2_state_offgrid_clusters_osun",
  "Oyo": "nesp2_state_offgrid_clusters_oyo",
  "Plateau": "nesp2_state_offgrid_clusters_plateau",
  "Rivers": "",
  "Sokoto": "nesp2_state_offgrid_clusters_sokoto",
  "Taraba": "",
  "Yobe": "nesp2_state_offgrid_clusters_yobe",
  "Zamfara": "nesp2_state_offgrid_clusters_zamfara",
}

// fetch info about states which have og_clusters
$.post({
    url: "/states-with-og-clusters",
    dataType: "json",
    success: function(data){statesWithOgClusters=data.states_with_og_clusters;},
})

function set_currently_featured_centroid_id(new_value){
    currently_featured_centroid_id = new_value;
}


function get_cluster_type() {
    if (document.getElementById("ogClustersCheckbox").checked == true) {answer = "og";}
    else {answer = "all";}
    return answer
}

function is_currently_loading_clusters(){
    return downloadingClusters;
};

function get_filtered_centroids_keys() {
    return browse_centroids_keys;
}
function set_filtered_centroids_keys(value) {
    browse_centroids_keys = value;
}

function give_status(context=null, display=false) {
    if (display == true) {
        console.log("Status on");
        if (context) {
            console.log(context);
        };
        console.log("    level " + level);
        console.log("    prevLevel " + previous_level);
        console.log("    State " + selectedState);
        console.log("    prevState " + prevState);
        console.log("Status over");
    }
};

function resetStateSelect() {
  prevState = selectedState;
  selectedState = "init";
  var s = document.getElementById('stateSelect');
  s.options[0].selected = true;
}

var sliderOptions = {
  connect: true,
  tooltips: true,
  format: wNumb({
    decimals: 2
  }),
};

// TODO: maybe redundant could use the same function for all sliders
function changeAreaSlider(str, h, values) {
  currentfilter.minarea = values[0];
  currentfilter.maxarea = values[1];
  if (values[1] == 200) {currentfilter.maxarea = 20000;}
  map.fireEvent("filterchange", currentfilter);
};

var maxAreaSliderFormat = wNumb({
    decimals: 0,
    suffix: ' km²',
    // show plus after value if it's 50
	edit: function( value ){
        if (value == '200 km²') {return('200+ km²');}
		else {return(value);}
	},
});

var areaSlider = document.getElementById('areaSlider');
noUiSlider.create(areaSlider, {
  ...sliderOptions,
  start: [0.1, 10],
  tooltips: [wNumb({decimals: 1, suffix: ' km²',}), maxAreaSliderFormat],
  range: {
    'min': [0, 0.1],
    '40%': [1, 0.5],
    '70%': [10, 1],
    '90%': [100, 10],
    'max': 200,
  },
});
areaSlider.noUiSlider.on("change", changeAreaSlider);
areaSlider.noUiSlider.on("end", update_filtered_settlements);

function changedtgSlider(str, h, values) {
  currentfilter.mindtg = values[0];
  currentfilter.maxdtg = values[1];
  if (values[1] == 0) {currentfilter.maxdtg = 1;}
  map.fireEvent("filterchange", currentfilter);
};

var dtgSliderFormat = wNumb({
    decimals: 0,
    suffix: ' km',
    // show plus after value if it's 50
	edit: function( value ){
        if (value == '50 km') {return('50+ km');}
        else if (value == '0 km') {return('0 km');}
		else {return(value);}
	},
});

var dtgSlider = document.getElementById('dtgSlider');
noUiSlider.create(dtgSlider, {
  ...sliderOptions,
  tooltips: [dtgSliderFormat, dtgSliderFormat],
  start: [0, 50],
  range: {
    'min': [0, 1],
    '50%': [10, 1],
    'max': [50, 1]
  }
});
dtgSlider.noUiSlider.on("change", changedtgSlider);
dtgSlider.noUiSlider.on("end", update_filtered_settlements);

function changeogAreaSlider(str, h, values) {
  currentfilter.ogminarea = values[0];
  currentfilter.ogmaxarea = values[1];
  map.fireEvent("ogfilterchange", currentfilter);
};
var ogAreaSlider = document.getElementById('ogAreaSlider');
noUiSlider.create(ogAreaSlider, {
  ...sliderOptions,
  //tooltips: [wNumb({decimals: 1, suffix: ' km²',}), wNumb({decimals: 0, suffix: ' km²',})],
  start: [0, 1000000],
  range: {
    'min': [0, 0.01],
    '70%': [0.5, 0.05],
    'max': 3.5,
  }
});
ogAreaSlider.noUiSlider.on("change", changeogAreaSlider);
ogAreaSlider.noUiSlider.on("end", update_filtered_settlements);


function changeogDistanceSlider(str, h, values) {
  currentfilter.ogmindtg = values[0];
  currentfilter.ogmaxdtg = values[1];
  map.fireEvent("ogfilterchange", currentfilter);
};
var ogDistanceSlider = document.getElementById('ogDistanceSlider');
noUiSlider.create(ogDistanceSlider, {
  ...sliderOptions,
  tooltips: [wNumb({decimals: 0, suffix: ' km',}), dtgSliderFormat ],
  start: [5, 1000],
  range: {
    'min': [5, 0.5],
    '50%': [10, 1],
    'max': 50,
  }
});
ogDistanceSlider.noUiSlider.on("change", changeogDistanceSlider);
ogDistanceSlider.noUiSlider.on("end", update_filtered_settlements);

function changeogBuildingsSlider(str, h, values) {
  currentfilter.ogminb = values[0];
  if (values[0] == 300) {currentfilter.ogminb = 0;}
  if (values[1] == 10000) {currentfilter.ogmaxb = 11000;}
  currentfilter.ogmaxb = values[1];
  map.fireEvent("ogfilterchange", currentfilter);
};


var ogBuildingsSliderMinFormat = wNumb({
    decimals: 0,
    // show < before value if it's 300
	edit: function( value ){
		return (value == '300') ? '< 300' : value;
	},
});

var ogBuildingsSliderMaxFormat = wNumb({
    decimals: 0,
    // show < before value if it's 300
	edit: function( value ){
		return (value == '10000') ? '10000+' : value;
	},
});


var ogBuildingsSlider = document.getElementById('ogBuildingsSlider');
noUiSlider.create(ogBuildingsSlider, {
  ...sliderOptions,
  tooltips: [ogBuildingsSliderMinFormat, ogBuildingsSliderMaxFormat],
  start: [300, 5000],
  range: {
    'min': [300, 10],
    '80%': [1000, 100],
    'max': 10000,
  }
});
ogBuildingsSlider.noUiSlider.on("change", changeogBuildingsSlider);
ogBuildingsSlider.noUiSlider.on("end", update_filtered_settlements);

function changeogBuildingsFootprintSlider(str, h, values) {
  currentfilter.ogminbfp = values[0];
  currentfilter.ogmaxbfp = values[1];
  map.fireEvent("ogfilterchange", currentfilter);
};
var ogBuildingsFootprintSlider = document.getElementById('ogBuildingsFootprintSlider');
noUiSlider.create(ogBuildingsFootprintSlider, {
  ...sliderOptions,
  tooltips: [wNumb({decimals: 2}) , wNumb({decimals: 2})],
  start: [0, 100],
  step: 1,
  range: {
    'min': 0,
    'max': 100,
  }
});
ogBuildingsFootprintSlider.noUiSlider.on("change", changeogBuildingsFootprintSlider);
ogBuildingsFootprintSlider.noUiSlider.on("end", update_filtered_settlements);


function update_filtered_settlements(msg) {
    var num_filtered_settlements = 0;
    if (selectedState != "init") {

        var [filtered_centroids_keys, num_total_settlements] = filter_settlements_ids();
        // update the global variable
        set_filtered_centroids_keys(filtered_centroids_keys)

        num_filtered_settlements = filtered_centroids_keys.length;

        // fetch the html element which displays settlements number
        if (get_cluster_type() == "og"){
            var filter_title = $("#n_ogclusters");
        }
        else{
            var filter_title = $("#n_clusters");
        }

        // prepare the message with updated settlements number
        var new_text = " " + num_filtered_settlements + " filtered settlements";
        if (num_filtered_settlements == 1){
            new_text = " " + num_filtered_settlements + " filtered settlement";
        };
        new_text = new_text + " out of " + num_total_settlements;

        // only update the message if the settlements are not being downloaded
        if (downloadingClusters == false){
            filter_title.text(new_text);
            filter_title = $("#filtered-clusters-num");
            filter_title.text(num_filtered_settlements);
        };
    }
    return num_filtered_settlements;
};


function set_toggle_value(toggle_id, value) {
    document.getElementById(toggle_id).checked = value;
};

function set_clusters_toggle(value) {
    set_toggle_value("clustersCheckbox", value)
};

function set_og_clusters_toggle(value) {
    set_toggle_value("ogClustersCheckbox", value)
};

function disable_sidebar__btn(className) {
  let answer = className;
  if (className.includes(" is-disabled")) {} else {
    className = className + " is-disabled";
  }
  return className;
};

function enable_sidebar__btn(className) {
  let answer = className;
  if (className.includes(" is-disabled")) {
    className = className.replace(" is-disabled", "");
  }
  return className;
};

function disable_sidebar__filter(className) {
  let answer = className;
  if (className.includes(" is-disabled")) {} else {
    className = className + " is-disabled";
  }
  return className;
};

function enable_sidebar__filter(className) {
  let answer = className;
  if (className.includes(" is-disabled")) {
    className = className.replace(" is-disabled", "");
  }
  return className;
};


function hide_sidebar__btn(className) {
  let answer = className;
  if (className.includes(" is-hidden")) {} else {
    className = className + " is-hidden";
  }
  return className;
};

function show_sidebar__btn(className) {
  let answer = className;
  if (className.includes(" is-disabled")) {
    className = className.replace(" is-disabled", "");
  }
  if (className.includes(" is-hidden")) {
    className = className.replace(" is-hidden", "");
  }
  return className;
};


function show_loading_cluster(){
    spinId = $("#" + get_cluster_type() + "-spin")[0];
    spinId.className = show_sidebar__btn(spinId.className);
}

function hide_loading_cluster(){
    spinId = $("#" + get_cluster_type() + "-spin")[0];
    spinId.className = hide_sidebar__btn(spinId.className);
}

function disable_sidebar_filter(className) {
  return className.replace(" active-filter", " hidden-filter");
};

function toggle_sidebar_filter(className) {
  let answer = className;
  if (className.includes(" hidden-filter")) {
    className = enable_sidebar_filter(className);
  } else if (className.includes(" active-filter")) {
    className = disable_sidebar_filter(className);
  }
  return className;
};

function enable_sidebar_filter(className) {
  return className.replace(" hidden-filter", " active-filter");
};


function adapt_sidebar_to_selection_level(selectionLevel) {

  var level_id = selectionLevel.charAt(0)
  // hide and show elements according to their classes
  var hidelist = document.getElementsByClassName(level_id + "_hide");
  var greylist = document.getElementsByClassName(level_id + "_grey");
  var showlist = document.getElementsByClassName(level_id + "_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].className = hide_sidebar__btn(hidelist[i].className);
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].className = show_sidebar__btn(showlist[j].className)
  }
  for (k = 0; k < greylist.length; k++) {
    greylist[k].className = disable_sidebar__btn(greylist[k].className)
  }

  document.getElementById("national").className = "cell small-6 level sidebar__btn";
  document.getElementById("state").className = "cell small-6 level sidebar__btn";
  document.getElementById("village").className = "cell small-6 level sidebar__btn";

  if (selectionLevel == "national"){
    document.getElementById("village").className = "cell small-6 level sidebar__btn inert disabled";
  }

  if (selectionLevel == "national") {
    document.getElementById("ogClustersTopLevelPanel").className = disable_sidebar__btn(document.getElementById("ogClustersTopLevelPanel").className);
  }
  else {
      if (ogClustersAvailability == false) {
        document.getElementById("ogClustersTopLevelPanel").className = disable_sidebar__btn(document.getElementById("ogClustersTopLevelPanel").className);
      } else {
        document.getElementById("ogClustersTopLevelPanel").className = enable_sidebar__btn(document.getElementById("ogClustersTopLevelPanel").className);
      }
  }

  document.getElementById(selectionLevel).className = "cell small-6 level sidebar__btn active";
};

function adapt_view_to_national_level() {
  give_status("adapt_view_to_national_level");
  map.setMinZoom(5);
  map.setZoom(6.5);
  map.options.maxZoom = 9;
  map.options.zoomSnap = 0.5;

  legend.addTo(map);
  gridLegend.remove();
  clusterInfo.remove();

  // load the states boundaries
  document.getElementById("statesCheckbox").checked = true;
  states_cb_fun();

  // Apply only at first landing
  if (selectedState == "init" && prevState == "init") {
    document.getElementById("heatmapCheckbox").checked = true;
    document.getElementById("nationalGridCheckbox").checked = true;
    set_clusters_toggle(false);
    set_og_clusters_toggle(false);
    document.getElementById("stateGridCheckbox").checked = false;
  }
  if (previous_level == "state" || previous_level == "village") {
    document.getElementById("heatmapCheckbox").checked = document.getElementById("clustersCheckbox").checked;
    document.getElementById("nationalGridCheckbox").checked = document.getElementById("stateGridCheckbox").checked;
  }
  // load the populated areas
  heatmap_cb_fun();
  // load the medium voltage grid on national level and untick the one on the state level
  nationalGrid_cb_fun();
  stateGrid_cb_fun();

  // Remotely mapped villages layer
  remove_layer(clusterLayer[selectedState]);
  remove_layer(ogClusterLayers[selectedState]);

  // reset the selected state to "init"
  resetStateSelect();

  // Trigger the filter function so that all geojson state are available again
  if (selectedState == "init" && prevState != "init") {
    update_nigeria_states_borders_geojson();
    update_nigeria_states_geojson();
  }

  remove_basemaps();

  add_layer(osm_gray);
  add_layer(national_background);

  // reactive fitting of Nigeria on the map
  map.fitBounds(L.latLngBounds(L.latLng(14, 15), L.latLng(4, 2.5)))
  // if the fitBound has smaller zoom level, update the min zoom level
  map.setMinZoom(map.getZoom() - map.options.zoomSnap);

  // update the info box on the top left
  update_infoBox()

  // Linked to the checkbox Grid
  remove_layer(state_grid_layer);


};

function adapt_view_to_state_level() {
  give_status("adapt_view_to_state_level");

  map.options.minZoom = 7;
  map.options.maxZoom = 18;
  map.options.zoomSnap = 1,

  legend.remove();
  gridLegend.addTo(map);

  // load the states boundaries
  document.getElementById("statesCheckbox").checked = true;
  states_cb_fun();

  if(previous_level == "national") {
    document.getElementById("stateGridCheckbox").checked = document.getElementById("nationalGridCheckbox").checked ;
  }

  // In States where there is no Grid, All Clusters should be shown instead of mapped village clusters
  if (ogClustersAvailability == false) {
    set_clusters_toggle(true);
  }
  else {
    // Choose remotely mapped settlements only when choosing state right after landing, otherwise
    // keep user options
    if (prevState == "init") {
        // Load the remotely mapped villages clusters
        set_og_clusters_toggle(true);
    }
    else {
        if (document.getElementById("clustersCheckbox").checked == true) {
            // Load the remotely mapped villages clusters
            set_og_clusters_toggle(true);
        }
    }
  }

  clusters_cb_fun();
  ogClusters_cb_fun();

  add_layer(nigeria_states_borders_geojson);

  add_layer(osm_gray);

  // remove the medium voltage grid
  document.getElementById("heatmapCheckbox").checked = false;
  heatmap_cb_fun();
  // remove the populated areas
  document.getElementById("nationalGridCheckbox").checked = false;
  stateGrid_cb_fun();
  nationalGrid_cb_fun();

  remove_layer(hot);

  remove_basemaps_except_osm_gray();
};

function adapt_view_to_village_level() {
  give_status("adapt_view_to_village_level");
  remove_layer(osm_gray);
  infoBox.remove();
  add_layer(hot);
};

/*
 * triggered by the click on the level buttons
 */

function national_button_fun(trigger="button") {
  previous_level = level;
  level = "national";
  adapt_sidebar_to_selection_level(level);
  adapt_view_to_national_level()
}

function state_button_fun(trigger="button") {
  previous_level = level;
  level = "state";

  // click on the state level button from national level
  if (previous_level == "national" && trigger == "button"){
      // select a random state which has off-grid clusters
      selectedState = statesWithOgClusters[Math.floor(Math.random()*statesWithOgClusters.length)]
      // Update the states menu list
      document.getElementById("stateSelect").value = selectedState;
  };

  // check if the og clusters are available
  ogClustersAvailability = statesWithOgClusters.includes(selectedState)
  adapt_sidebar_to_selection_level(level);

  // updates the bounds of the selected state's layer
  updateSelectedStateBounds()
  // manages the layers for the state level
  adapt_view_to_state_level();

  update_centroids("state_button_615");

  // When coming from village to state level it should not zoom out to the selected state
  if (previous_level == "national" || previous_level == "state" || (previous_level == "village" && trigger == "map-click")) {
    zoomToSelectedState();
    // Trigger the filter function so that the selected state geojson does not hide the clusters
    update_nigeria_states_borders_geojson();
    update_nigeria_states_geojson();

    update_clusterInfo(get_cluster_type())

  };
  if (previous_level == "village" && (trigger == "button" || trigger == "zoom")) {
    if (trigger != "zoom") {
        zoomToSelectedState();
    };
  }
};

function village_button_fun(trigger="button") {
  previous_level = level;
  level = "village";
  adapt_sidebar_to_selection_level(level);
  // click on the village level button from national level, first select a random state
  if (previous_level == "national" && trigger == "button"){
      // select a random state which has off-grid clusters
      selectedState = statesWithOgClusters[Math.floor(Math.random()*statesWithOgClusters.length)]
      // Update the states menu list
      document.getElementById("stateSelect").value = selectedState;
      // Load the remotely mapped villages clusters
      set_og_clusters_toggle(true);
      ogClusters_cb_fun()
      updateSelectedStateBounds()

      // Trigger the filter function so that the selected state geojson does not hide the clusters
      update_nigeria_states_borders_geojson();
      update_nigeria_states_geojson();


  };
  // click on the village level button from national or state level
  if ((previous_level == "national" || previous_level == "state") && trigger == "button"){
    //pick a random cluster among the large ones and display it
    get_random_ogCluster_fun()
  };

  adapt_view_to_village_level();

};

// Triggered by the national and state views
function states_cb_fun() {
  var sCheckBox = document.getElementById("statesCheckbox")
  if (sCheckBox.checked == true) {
    if (level != "national"){add_layer(nigeria_states_borders_geojson)}
    if (level == "national"){remove_layer(nigeria_states_borders_geojson)}
    add_layer(nigeria_states_geojson);
  } else {
    remove_layer(nigeria_states_borders_geojson);
    remove_layer(nigeria_states_geojson);
  }



  //https://stackoverflow.com/questions/31765968/toggle-url-parameter-with-button
  //https://dev.to/gaels/an-alternative-to-handle-global-state-in-react-the-url--3753
  //https://stackoverflow.com/questions/13063838/add-change-parameter-of-url-and-redirect-to-the-new-url/13064060
  /*$.get({url: $SCRIPT_ROOT,
  data: {
        grid_content: gCheckBox.checked,
        states_content: sCheckBox.checked,
  },
  });
*/
}

// Triggered by user interaction of the stateSelect dropdown menu
function state_dropdown_fun() {
  // Work only if the selected state is different than the currenlty selected
  if (selectedState != document.getElementById("stateSelect").value) {
    prevState = selectedState;
    //update the selected state
    selectedState = document.getElementById("stateSelect").value;
    //Trigger the switch to state level
    state_button_fun(trigger="menu");
  }
};

/*
Triggered by the checkbox Identified settlements by satellite imagery on national level only

Parameters
----------
    :trigger: str, can be one of ('user', 'map-click', 'zoom', 'random-cluster', 'init', 'button')
*/
function heatmap_cb_fun(trigger=null) {
  var checkBox = document.getElementById("heatmapCheckbox");
  if (checkBox.checked == true) {
    document.getElementById("heatmapPanel").style.borderLeft = '.25rem solid #1DD069';
    add_layer(national_heatmap);
    if (trigger == "user") {
        //activate all clusters
        set_clusters_toggle(true);
        // deactivate og clusters
        set_og_clusters_toggle(false);
        clusters_cb_fun();
        ogClusters_cb_fun();
  }
  } else {
    document.getElementById("heatmapPanel").style.borderLeft = '.25rem solid #eeeff1';
    remove_layer(national_heatmap);
    national_heatmap.bringToFront();
    if (trigger == "user") {
        //deactivate all clusters
        set_clusters_toggle(false);
        clusters_cb_fun();
        ogClusters_cb_fun();
  }
  }
}

// Triggered by the checkbox Medium Voltage Grid on national level only
function nationalGrid_cb_fun() {
  var checkBox = document.getElementById("nationalGridCheckbox");
  if (checkBox.checked == true) {
    document.getElementById("nationalGridPanel").style.borderLeft = '.25rem solid #1DD069';
    add_layer(national_grid);
  } else {
    document.getElementById("nationalGridPanel").style.borderLeft = '.25rem solid #eeeff1';
    remove_layer(national_grid);
  }
}
var random_cluster = false;
//pick a random cluster among the large ones and display it
function get_random_ogCluster_fun() {

    $.post({
            url: "/random-cluster",
            dataType: "json",
            data: {"state_name": selectedState},
            success: function(data){
                random_cluster = true;
                //this will trigger a fly to the point
                map.flyTo(L.latLng(data.lat, data.lng), 14, {animate:false});
            }
    }).done(function (data) {random_cluster = false;});
}
function download_clusters_fun() {
  var export_csv_link = document.getElementById("export_csv")

  var checkBox = document.getElementById("clustersCheckbox");
  // currently there are only two filters which are mutually exclusive
  if (checkBox.checked == true){

    export_csv_link.href = "/csv-export"
    + "?state=" + selectedState
    + "&cluster_type=cluster"
    + "&min_area=" + currentfilter.minarea
    + "&max_area=" + currentfilter.maxarea
    + "&mindtg=" + currentfilter.mindtg
    + "&maxdtg=" + currentfilter.maxdtg
  }
  else{

    export_csv_link.href = "/csv-export"
    + "?state=" + selectedState
    + "&cluster_type=ogcluster"
    + "&ogmin_area=" + currentfilter.ogminarea
    + "&ogmax_area=" + currentfilter.ogmaxarea
    + "&ogmindtg=" + currentfilter.ogmindtg
    + "&ogmaxdtg=" + currentfilter.ogmaxdtg
    + "&ogminb=" + currentfilter.ogminb
    + "&ogmaxb=" + currentfilter.ogmaxb
    + "&ogminbfp=" + currentfilter.ogminbfp
    + "&ogmaxbfp=" + currentfilter.ogmaxbfp
  }
  export_csv_link.click()
}

/*
Triggered by the checkbox Identified settlements by satellite imagery on state level only

Parameters
----------
    :trigger: str, can be one of ('user', 'map-click', 'zoom', 'random-cluster', 'init', 'button')
*/
function clusters_cb_fun(trigger=null) {
  var filter_icon = document.getElementById("clusters_filter");

  if (prevState != "init") {
    remove_layer(clusterLayer[prevState])
  }
  if (document.getElementById("clustersCheckbox").checked == true) {
    // set panel side to green
    document.getElementById("clustersPanel").style.borderLeft = '.25rem solid #1DD069';
    // deactivate og clusters
    set_og_clusters_toggle(false);
    ogClusters_cb_fun();

    if(trigger == "user"){
        update_centroids("line 782")
    };

    add_layer(clusterLayer[selectedState]);
    // update the number of clusters available
    update_clusterInfo("all");
    // enable actions with filter icon if screen is not mobile phone
    if($(window).width() > screen_width_threshold) {
        filter_icon.className = enable_sidebar__filter(filter_icon.className);
    }
    else{
        filter_icon.className = disable_sidebar__filter(filter_icon.className);
    }

  } else {
  // set panel side to grey
    document.getElementById("clustersPanel").style.borderLeft = '.25rem solid #eeeff1';
    remove_layer(clusterLayer[selectedState]);
    // Close the filters if they were available
    clusters_filter_fun();
    // disable actions with filter icon
    filter_icon.className = disable_sidebar__filter(filter_icon.className);

    if(document.getElementById("ogClustersCheckbox").checked == false) {
        clusterInfo.remove()
    }

  }

  /*$.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
    states_content: stateCheckBox.checked
  },
  });
  */
}

/*
Triggered by the checkbox Remotely mapped settlements on state level only

Parameters
----------
    :trigger: str, can be one of ('user', 'map-click', 'zoom', 'random-cluster', 'init', 'button')
*/
function ogClusters_cb_fun(trigger=null) {
  var filter_icon = document.getElementById("ogClusters_filter");

  if (prevState != "init") {
    remove_layer(ogClusterLayers[prevState])
  }
  var checkBox = document.getElementById("ogClustersCheckbox");
  if (checkBox.checked == true) {
    // set panel side to green
    document.getElementById("ogClustersPanel").style.borderLeft = '.25rem solid #1DD069';
    // deactivate clusters
    set_clusters_toggle(false);
    clusters_cb_fun();

    if(trigger == "user"){
        update_centroids("line 872")
    };
    add_layer(ogClusterLayers[selectedState]);
    // update the number of clusters available
    update_clusterInfo("og");
    // enable actions with filter icon if screen is not mobile phone
    if($(window).width() > screen_width_threshold) {
        filter_icon.className = enable_sidebar__filter(filter_icon.className);
    }
    else{
        filter_icon.className = disable_sidebar__filter(filter_icon.className);
    }

  } else {
  // set panel side to grey
    document.getElementById("ogClustersPanel").style.borderLeft = '.25rem solid #eeeff1';
    remove_layer(ogClusterLayers[selectedState]);
    // Close the filters if they were available
    ogClusters_filter_fun();
    // disable actions with filter icon
    filter_icon.className = disable_sidebar__filter(filter_icon.className);
    if(document.getElementById("clustersCheckbox").checked == false) {
        clusterInfo.remove()
    }
  }
}

function template_filter_fun(id) {
  var newFilter = document.getElementsByName(id + "Content");
  var checkBox = document.getElementById(id + "Checkbox");
  if (checkBox.checked == true) {

    var i;
    for (i = 0; i < newFilter.length; i++) {
      newFilter[i].className = toggle_sidebar_filter(newFilter[i].className)
    }

    var prevFilter = document.querySelectorAll(".content-filter");
    var j;
    for (j = 0; j < prevFilter.length; j++) {

      if (prevFilter[j].attributes.name.value !== id + "Content") {
        prevFilter[j].className = disable_sidebar_filter(prevFilter[j].className);

      }
    }
    if (id == "clusters") {

        map.fireEvent("filterchange", currentfilter);
        update_filtered_settlements();
    }
    else{

        map.fireEvent("ogfilterchange", currentfilter);
        update_filtered_settlements();
    }
  } else {
    var prevFilter = document.querySelectorAll(".content-filter");
    var j;
    for (j = 0; j < prevFilter.length; j++) {

      if (prevFilter[j].attributes.name.value === id + "Content") {
        prevFilter[j].className = disable_sidebar_filter(prevFilter[j].className);
      }
    }

  }
}

function clusters_filter_fun() {
  template_filter_fun("clusters");
}
function ogClusters_filter_fun() {
  template_filter_fun("ogClusters");
}



// Triggered by the checkbox Grid
function stateGrid_cb_fun() {
  if(level != "national") {
      var checkBox = document.getElementById("stateGridCheckbox");
      if (checkBox.checked == true) {
        document.getElementById("stateGridPanel").style.borderLeft = '.25rem solid #1DD069';
        add_layer(state_grid_layer);
      } else {
        document.getElementById("stateGridPanel").style.borderLeft = '.25rem solid #eeeff1';
        remove_layer(state_grid_layer);
      }
  }
  /*$.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
    states_content: stateCheckBox.checked
  },
  });*/
}

function buildingDensity_cb_fun() {
  var checkBox = document.getElementById("buildingDensityCheckbox");
  if (checkBox.checked == true) {
    add_layer(buildingDensity)
  } else {
    remove_layer(buildingDensity)
  }
}

// The following functions allow to asynchronously query cluster data and create a layer with them
// Handling is made somewhat difficult: due to asynchronous nature of the call the data cannot simply
// be stored in a variable. Therefore the data are used to create a geojson-layer in a layergroup.
// The layer can then be selected via it's _leaflet_id

// Function asynchronously calls geojsons with centroids of selected state
function update_centroids_data(handleData){
    if(level != "national"){
        var cluster_type = get_cluster_type();
        var centroids_file_key = selectedState
        if (selectedState == "init"){
            centroids_file_key = "Kano";
        }
        // this fetches the url described by the fetch_centroids() view in app/__init__.py
        $.get({
            url: "/centroids",
            dataType: "json",
            data: {"cluster_type": cluster_type, "state": centroids_file_key},
            success: function(data){
                handleData(data, centroids_file_key, cluster_type);
                }
        });
    };
};

/*
    Parse what is essentially a matrix in a jsonified lightweight format. The keys are the state
    code, the number of row ("length" = N), the M column names and the values of the matrix.
        the values are in a single array of size N * M
    By looping from 1 --> N the matrix is rebuilt by assigning the values to the correct columns.
    First column property will get values at index 0 -> N, while the ith column will get the values
    at index 0 + i*N -> (i + 1)*N
*/
function convert_light_json_to_geojson(data, cluster_type) {
    var geojson_features = [];
    var N = data.length;

    if(cluster_type == "og") {
        for (j = 0; j < N; j++) {
            geojson_features[j] = {
                "type": "Feature", "properties": {
                    "adm1_pcode": data.adm1_pcode,
                    "cluster_offgrid_id": data.values[j],
                    "area_km2": data.values[N + j],
                    "grid_dist_km": data.values[2 * N + j],
                    "building_count": data.values[3 * N + j],
                    "percentage_building_area": data.values[4 * N + j],
                    "bb_east": data.values[5 * N + j],
                    "bb_north": data.values[6 * N + j],
                    "bb_south": data.values[7 * N + j],
                    "bb_west": data.values[8 * N + j],
                },
                "geometry": { "type": "Point", "coordinates": [ data.values[9 * N + j], data.values[10 * N + j] ] },
            };
        };
    }
    else {
        for (j = 0; j < N; j++) {
            geojson_features[j] = {
                "type": "Feature", "properties": {
                    "adm1_pcode": data.adm1_pcode,
                    "cluster_all_id": data.values[j],
                    "area_km2": data.values[N + j],
                    "grid_dist_km": data.values[2 * N + j],
                    "fid": data.values[3 * N + j],
                    "bb_east": data.values[4 * N + j],
                    "bb_north": data.values[5 * N + j],
                    "bb_south": data.values[6 * N + j],
                    "bb_west": data.values[7 * N + j],
                },
                "geometry": { "type": "Point", "coordinates": [ data.values[8 * N + j], data.values[9 * N + j] ] },
            };
        };

    };
    geojson_features = {
    "type": "FeatureCollection",
    "name": "adm1_pcode_" + data.adm1_pcode,
    "crs": { "type": "name", "properties": { "name": "urn:ogc:def:crs:OGC:1.3:CRS84" } },
    "features": geojson_features}
    return geojson_features
};

// Function takes the data from update_centroids_data. Due to the asynchronous call they cannot simply be stored in a variable
function update_centroids(msg){
  console.log("update centroid: " + msg);
  var cluster_type = get_cluster_type();
  if (get_cluster_type() == "og"){
    var filter_title = $("#n_ogclusters");
  }
  else{
      var filter_title = $("#n_clusters");
  }
  var new_text = "= ... loading clusters info ...";
  filter_title.text(new_text);

  if (centroids_layer_ids[selectedState] === undefined) {
    centroids_layer_ids[selectedState] = {};
  }
  // only fetch the data if it does not exist yet
  if (centroids_layer_ids[selectedState][cluster_type] === undefined){
        // to prevent filter to update while downloading
        downloadingClusters = true;
        show_loading_cluster();
        // Due to the asynchronous call we must provide a function as argument of update_centroids_data
        update_centroids_data(handleData=function(data, centroids_file_key, cluster_type){
            var centroids = convert_light_json_to_geojson(data, cluster_type)
            // Creates a geojson-layer with the data

            var centroids_layer = L.geoJSON(centroids, {
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, {
                        interactive: false,
                        radius: 0,
                        weight: 5,
                        opacity: 0,
                        fillOpacity: 0,
                    });
                }
            });
            // add geojson-layer to a group
            centroidsGroup.addLayer(centroids_layer);
            // store the _leaflet_id of the centroids layer in a variable. The layer can be called with this id.
            centroids_layer_id = centroidsGroup.getLayerId(centroids_layer)
            // store this id in a dict with state name as keys
            centroids_layer_ids[centroids_file_key][cluster_type] = centroids_layer_id
            // reset the download flag to false
            downloadingClusters = false;
            hide_loading_cluster();
            //update the filters
            update_filtered_settlements()
            update_clusterInfo(get_cluster_type())
        });
  }
  else{
    centroids_layer_id = centroids_layer_ids[selectedState][cluster_type]
    //update the filters
    update_filtered_settlements()
    hide_loading_cluster();
  }
};

// initial call of this function upon map start is necessary
update_centroids("initial_1072");

// End of functions for asynchronous call

// functions takes in centroid from cluster-centroid-layer and returns its bounds from properties
function get_bbox_from_cluster_centroid(centroid){
  var north = centroid.feature.properties.bb_north;
  var east = centroid.feature.properties.bb_east;
  var south = centroid.feature.properties.bb_south;
  var west = centroid.feature.properties.bb_west;
  var bbox = [[south,west],[north,east]]
  return(bbox);
}

/* assign the geojson layers of the currently loaded settlements clusters */
function update_current_state_settlements(){
  current_cluster_centroids = centroidsGroup._layers;
}

function get_current_centroids_from_layer(){
  centroids = current_cluster_centroids[centroids_layer_id]._layers;
  return(centroids);
}

function get_centroid_by_id(centroid_id){
  centroid = current_cluster_centroids[centroids_layer_id]._layers[centroid_id];
  return(centroid);
}


/* updates the list of cluster keys in filtered_centroids_keys, only used in update_filter function */
function filter_settlements_ids(){
  var filtered_centroids_keys = [];
  update_current_state_settlements();
  centroids = get_current_centroids_from_layer();
  const keys = Object.keys(centroids);
  var total_clusters = 0;
  // interates though cluster centroids and pushes keys of clusters that fall within filter settings
  for (const key of keys) {
    //if activated clusters are off-grid-clusters
    if (centroids[key].feature.properties.hasOwnProperty('percentage_building_area')){
      total_clusters = total_clusters + 1;
      if (
        centroids[key].feature.properties.grid_dist_km >= currentfilter.ogmindtg && 
        centroids[key].feature.properties.grid_dist_km <= currentfilter.ogmaxdtg &&
        centroids[key].feature.properties.building_count >= currentfilter.ogminb &&
        centroids[key].feature.properties.building_count <= currentfilter.ogmaxb &&
        centroids[key].feature.properties.percentage_building_area >= currentfilter.ogminbfp &&
        centroids[key].feature.properties.percentage_building_area <= currentfilter.ogmaxbfp
      ){
        filtered_centroids_keys.push({"key": key, "area": centroids[key].feature.properties.building_count});
        og_centroids_dict[centroids[key].feature.properties.cluster_offgrid_id] = key;
      }
    }
    else if (centroids[key].feature.properties.hasOwnProperty('cluster_all_id')){
      total_clusters = total_clusters + 1;
      if (
        centroids[key].feature.properties.area_km2 >= currentfilter.minarea &&
        centroids[key].feature.properties.area_km2 <= currentfilter.maxarea &&
        centroids[key].feature.properties.grid_dist_km >= currentfilter.mindtg &&
        centroids[key].feature.properties.grid_dist_km <= currentfilter.maxdtg
      ){
        filtered_centroids_keys.push({"key": key, "area": centroids[key].feature.properties.area_km2});
        all_centroids_dict[centroids[key].feature.properties.cluster_all_id] = key;
      }
    }
  }
  // sort the keys according to area (for og clusters, the area is replaced by building count)
  filtered_centroids_keys.sort(function(a, b) {
      return a.area < b.area;
  });
  // only keep the keys of the clusters
  var answer = [];
  for (var i = 0; i<filtered_centroids_keys.length; i++) {
      answer[i] = filtered_centroids_keys[i].key;
  }

  return [answer, total_clusters];
}

function update_current_cluster(filtered_centroids_keys){
    var centroid = get_centroid_by_id(currently_featured_centroid_id);
    const clusterNum = filtered_centroids_keys.indexOf(currently_featured_centroid_id) + 1;
    const selectedClustersNum = filtered_centroids_keys.length;
    update_clusterInfo(centroid.feature.properties, selectedClustersNum, clusterNum);
}

// flyTo-function including a with reset of 'currently_flying_to_cluster' to false in order to allow level change via manual zoom afterwards
function flyToClusterBounds(target){
  currently_flying_to_cluster = true;
  map.flyToBounds(target,{animate:false});
    map.once('moveend', function() {
      currently_flying_to_cluster = false;
    },{animate:false});
}

/* triggered by click on right arrow of the "Browse the settlements" infoCLuster box */
function next_selection_fun(){
  update_current_state_settlements();
  var centroid = Object();
  var target = [[0,0][0,0]];
  var filtered_centroids_keys = get_filtered_centroids_keys();
  // select next cluster and to zoom to its bounds
  // if currently no centroid has been selected, set the selection to the first cluster and fly there
  if(filtered_centroids_keys.indexOf(currently_featured_centroid_id) == -1){
    set_currently_featured_centroid_id(filtered_centroids_keys[0]);
  }
  // else if the selected centroid is the last one, select the first one
  else if (filtered_centroids_keys.indexOf(currently_featured_centroid_id) == filtered_centroids_keys.length -1){
    set_currently_featured_centroid_id(filtered_centroids_keys[0]);
  }
  // else set the selected centroid to be the next one via index
  else{
    set_currently_featured_centroid_id(filtered_centroids_keys[filtered_centroids_keys.indexOf(currently_featured_centroid_id) + 1 ]);
  }
  // get the centroid from its id and fly to its bounds
  centroid = (current_cluster_centroids[centroids_layer_id]._layers[currently_featured_centroid_id]);
  target = get_bbox_from_cluster_centroid(centroid);
  flyToClusterBounds(target,{animate:false});
  update_current_cluster(filtered_centroids_keys);
}

/* triggered by click on left arrow of the "Browse the settlements" infoCLuster box */
function prev_selection_fun(){
  update_current_state_settlements();
  var centroid = Object();
  var target = [[0,0][0,0]];
  var filtered_centroids_keys = get_filtered_centroids_keys();
  // if currently no centroid has been selected, set the selection to the first cluster
  if(filtered_centroids_keys.indexOf(currently_featured_centroid_id) == -1){
    set_currently_featured_centroid_id(filtered_centroids_keys[0]);
  }
  // else if the selected centroid is the first one, select the last one
  else if (filtered_centroids_keys.indexOf(currently_featured_centroid_id) == 0){
   set_currently_featured_centroid_id(filtered_centroids_keys[0]);
  }
  // else set the selected centroid to be the previous one via index
  else{
    set_currently_featured_centroid_id(filtered_centroids_keys[filtered_centroids_keys.indexOf(currently_featured_centroid_id) - 1 ]);
  }
  // get the centroid from its id and fly to its bounds
  centroid = get_centroid_by_id(currently_featured_centroid_id);
  target = get_bbox_from_cluster_centroid(centroid);
  flyToClusterBounds(target,{animate:false});
  update_current_cluster(filtered_centroids_keys);
}
