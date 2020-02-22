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
var level = "national";
var previous_level = level;
var statesList = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];
var selectedState = "init";
var selectedLGA = "";
var thirtythreeKV = "33_kV_" + selectedState.toLowerCase();
var currentfilter = {
    minarea: 0.1,
    maxarea: 10,
    mindtg: 0,
    maxdtg: 100,
    ogminarea: 0.1,
    ogmaxarea: 10,
    ogmindtg: 0,
    ogmaxdtg: 100,
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
  "Nasarawa": "nesp2_state_grid_nasawara",
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

function resetStateSelect(){
    selectedState = "init"
    var s = document.getElementById('stateSelect')
    s.options[0].selected = true;
}


var sliderOptions = {
    connect: true,
    tooltips: true,
    format: wNumb({
        decimals: 2
    }),
};

function changeAreaSlider(str, h, values) {
    currentfilter.minarea = values[0];
    currentfilter.maxarea = values[1];
    map.fireEvent("filterchange", currentfilter);
};
var areaSlider = document.getElementById('areaSlider');
noUiSlider.create(areaSlider, {
    ...sliderOptions,
    start: [0.1, 10],
    range: {
        'min': 0,
        'max': 10,
    },
});
areaSlider.noUiSlider.on("change", changeAreaSlider);

function changedtgSlider(str, h, values) {
    currentfilter.mindtg = values[0];
    currentfilter.maxdtg = values[1];
    map.fireEvent("filterchange", currentfilter);
};
var dtgSlider = document.getElementById('dtgSlider');
noUiSlider.create(dtgSlider, {
    ...sliderOptions,
    start: [0, 100],
    range: {
        'min': 0,
        'max': 100,
    }
});
dtgSlider.noUiSlider.on("change", changedtgSlider);

function changeogAreaSlider(str, h, values) {
    currentfilter.ogminarea = values[0];
    currentfilter.ogmaxarea = values[1];
    map.fireEvent("filterchange", currentfilter);
};
var ogAreaSlider = document.getElementById('ogAreaSlider');
noUiSlider.create(ogAreaSlider, {
    ...sliderOptions,
    start: [0.1, 10],
    range: {
        'min': 0,
        'max': 10,
    }
});
ogAreaSlider.noUiSlider.on("change", changeogAreaSlider);

function changeogDistanceSlider(str, h, values) {
    currentfilter.ogmindtg = values[0];
    currentfilter.ogmaxdtg = values[1];
    map.fireEvent("filterchange", currentfilter);
};
var ogDistanceSlider = document.getElementById('ogDistanceSlider');
noUiSlider.create(ogDistanceSlider, {
    start: [5, 1000],
    ...sliderOptions,
    range: {
        'min': 0,
        'max': 1000,
    }
});
ogDistanceSlider.noUiSlider.on("change", changeogDistanceSlider);

function disable_sidebar__btn(className){
    let answer=className;
    if (className.includes(" is-disabled")){}
    else {className = className + " is-disabled";}
    return className;
};

function enable_sidebar__btn(className){
    let answer=className;
    if (className.includes(" is-disabled")){className = className.replace(" is-disabled", "");}
    return className;
};

function hide_sidebar__btn(className){
    let answer=className;
    if (className.includes(" is-hidden")){}
    else {className = className + " is-hidden";}
    return className;
};

function show_sidebar__btn(className){
    let answer=className;
    if (className.includes(" is-disabled")){className = className.replace(" is-disabled", "");}
    if (className.includes(" is-hidden")){className = className.replace(" is-hidden", "");}
    return className;
};


function disable_sidebar_filter(className){
    return className.replace(" active-filter", " hidden-filter");
};

function toggle_sidebar_filter(className){
    let answer=className;
    if (className.includes(" hidden-filter")){className = enable_sidebar_filter(className);}
    else if (className.includes(" active-filter")){className = disable_sidebar_filter(className);}
    return className;
};

function enable_sidebar_filter(className){
    return className.replace(" hidden-filter", " active-filter");
};


function adapt_sidebar_to_selection_level(selectionLevel) {

  var level_id =  selectionLevel.charAt(0)
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

  document.getElementById(selectionLevel).className = "cell small-6 level sidebar__btn active";
};

function adapt_view_to_national_level() {
  map.options.minZoom = 6.6;
  map.options.maxZoom = 9;
  map.options.zoomSnap = 0.5;
  map.fitBounds([[2, 0],[15, 17]]); // [[S, W]],[[N, E]]

  legend.addTo(map);
  gridLegend.remove();

  // load the states boundaries
  document.getElementById("statesCheckbox").checked = true;
  states_cb_fun();
  // load the populated areas
  document.getElementById("heatmapCheckbox").checked = true;
  heatmap_cb_fun();
  // load the medium voltage grid
  document.getElementById("nationalGridCheckbox").checked = true;
  nationalGrid_cb_fun();

  // reset the selected state to None
  resetStateSelect()
  remove_layer(selected_state_pbf);

  remove_basemaps();

  map.addLayer(osm_gray);
  map.addLayer(national_background);

  // Remotely mapped villages layer
  remove_layer(ogClusterLayers[selectedState]);

  // Linked to the checkbox Grid
  remove_layer(grid_layer);
};

function adapt_view_to_state_level(previous_level) {
  console.log("adapt_view_to_state_level");

  map.options.minZoom = 8;
  map.options.maxZoom = 19;
  map.options.zoomSnap = 1,

  legend.remove();
  gridLegend.addTo(map);

  // load the states boundaries
  document.getElementById("statesCheckbox").checked = true;
  states_cb_fun();
  document.getElementById("gridCheckbox").checked = true;
  // Load the remotely mapped villages clusters
  document.getElementById("ogClustersCheckbox").checked = true;
  ogClusters_cb_fun();


  update_selected_state_pbf()
  update_grid_layer();
  //update_ogclustersTileLayer();
  add_layer(osm_gray);

  // remove the medium voltage grid
  document.getElementById("heatmapCheckbox").checked = false;
  heatmap_cb_fun();
  // remove the populated areas
  document.getElementById("nationalGridCheckbox").checked = false;
  nationalGrid_cb_fun();

  remove_layer(hot);

  remove_basemaps_except_osm_gray();

  // When coming from village to state level it should not zoom out to the selected state
  if (previous_level == "national" || previous_level == "state") {
    zoomToSelectedState();

  // Trigger the filter function so that the selected state geojson does not hide the clusters
  nigeria_states_geojson.clearLayers()
  nigeria_states_geojson.addData(nigeria_states_simplified)
  }
};

function adapt_view_to_village_level() {
  remove_layer(osm_gray);
  info.remove();
  add_layer(hot);
}

/*
* triggered by the click on the level buttons
*/

function national_button_fun() {
  level="national";
  adapt_sidebar_to_selection_level(level);
  adapt_view_to_national_level()
}

function state_button_fun() {
  previous_level = level
  level="state";
  adapt_sidebar_to_selection_level(level);
  adapt_view_to_state_level(previous_level);
};

function village_button_fun() {
  level="village";
  adapt_sidebar_to_selection_level(level);
  adapt_view_to_village_level();
};

// Triggered by the selection of a state with the combobox/dropdown menu
function states_cb_fun() {
  var sCheckBox = document.getElementById("statesCheckbox")
  if (sCheckBox.checked == true){
    add_layer(statesLayer)
    add_layer(nigeria_states_geojson)
  }
  else {
    remove_layer(statesLayer)
    remove_layer(nigeria_states_geojson)
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
function state_dropdown_fun(){
  // Work only if the selected state is different than the currenlty selected
  if (selectedState != document.getElementById("stateSelect").value){
      //update the selected state
      selectedState = document.getElementById("stateSelect").value;
      //Trigger the switch to state level
      state_button_fun();
  }
};



// Triggered by the checkbox Populated Areas
function heatmap_cb_fun() {
  var checkBox = document.getElementById("heatmapCheckbox");
  if (checkBox.checked == true){
    document.getElementById("heatmapPanel").style.borderLeft= '.25rem solid #1DD069';
    add_layer(national_heatmap);
  }
  else {
    document.getElementById("heatmapPanel").style.borderLeft= '0rem';
    remove_layer(national_heatmap);
    national_heatmap.bringToFront();
  }
}

// Triggered by the checkbox Medium Voltage Grid
function nationalGrid_cb_fun() {
  var checkBox = document.getElementById("nationalGridCheckbox");
  if (checkBox.checked == true){
    document.getElementById("nationalGridPanel").style.borderLeft= '.25rem solid #1DD069';
    add_layer(national_grid);
  }
  else {
    document.getElementById("nationalGridPanel").style.borderLeft= '0rem';
    remove_layer(national_grid);
  }
}

function clusters_cb_fun() {
  var checkBox = document.getElementById("clustersCheckbox");
  if (checkBox.checked == true){
    document.getElementById("clustersPanel").style.borderLeft= '.25rem solid #1DD069';
    document.getElementById("ogClustersCheckbox").checked = false;
    ogClusters_cb_fun();
    add_layer(clusterLayer[selectedState]);
  } else {
    document.getElementById("clustersPanel").style.borderLeft= '0rem';
    remove_layer(clusterLayer[selectedState]);
  }

  /*$.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
    states_content: stateCheckBox.checked
  },
  });
  */
}

function template_filter_fun(id){
    var newFilter = document.getElementsByName(id);
    var i;
    for (i = 0; i < newFilter.length; i++) {
       newFilter[i].className = toggle_sidebar_filter(newFilter[i].className)
    }

   var prevFilter = document.querySelectorAll(".content-filter");
    var j;
    for (j = 0; j < prevFilter.length; j++) {

       if(prevFilter[j].attributes.name.value !== id){
            prevFilter[j].className = disable_sidebar_filter(prevFilter[j].className);
       }
    }
    map.fireEvent("filterchange", currentfilter);
}

function clusters_filter_fun(){
    template_filter_fun("clustersContent");
}


function ogClusters_cb_fun() {
  var checkBox = document.getElementById("ogClustersCheckbox");
  if (checkBox.checked == true){
    document.getElementById("ogClustersPanel").style.borderLeft= '.25rem solid #1DD069';
    document.getElementById("clustersCheckbox").checked = false;
    clusters_cb_fun();
    add_layer(ogClusterLayers[selectedState]);

  } else {
    document.getElementById("ogClustersPanel").style.borderLeft= '.0rem';
    remove_layer(ogClusterLayers[selectedState]);
  }
}

function ogClusters_filter_fun(){
    template_filter_fun("ogClustersContent");
}


// Triggered by the checkbox Grid
function grid_cb_fun() {
  var checkBox = document.getElementById("gridCheckbox");
  if (checkBox.checked == true){
    document.getElementById("gridPanel").style.borderLeft= '.25rem solid #1DD069';
    add_layer(grid_layer);
  }
  else{
    document.getElementById("gridPanel").style.borderLeft= '0rem';
    remove_layer(grid_layer);
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
  if (checkBox.checked == true){
    add_layer(buildingDensity)
  }
  else {
    remove_layer(buildingDensity)
  }
}

function download_clusters_fun() {
    var export_csv_link = document.getElementById("export_csv")
    export_csv_link.href="/csv-export?state="+selectedState+"&min_area=" + currentfilter.minarea +
    "&max_area=" + currentfilter.maxarea
    export_csv_link.click()
}


function lga_cb_fun(){
  /*var checkBox = document.getElementById("lgaCheckbox");
  if (checkBox.checked == true){
    add_layer(lgas_pbf)
  }
  else {
    remove_layer(lgas_pbf)
  }
  */
}

function addParameter(url, parameterName, parameterValue, atStart/*Add param before others*/){
    replaceDuplicates = true;
    if(url.indexOf('#') > 0){
        var cl = url.indexOf('#');
        urlhash = url.substring(url.indexOf('#'),url.length);
    } else {
        urlhash = '';
        cl = url.length;
    }
    sourceUrl = url.substring(0,cl);

    var urlParts = sourceUrl.split("?");
    var newQueryString = "";

    if (urlParts.length > 1)
    {
        var parameters = urlParts[1].split("&");
        for (var i=0; (i < parameters.length); i++)
        {
            var parameterParts = parameters[i].split("=");
            if (!(replaceDuplicates && parameterParts[0] == parameterName))
            {
                if (newQueryString == "")
                    newQueryString = "?";
                else
                    newQueryString += "&";
                newQueryString += parameterParts[0] + "=" + (parameterParts[1]?parameterParts[1]:'');
            }
        }
    }
    if (newQueryString == "")
        newQueryString = "?";

    if(atStart){
        newQueryString = '?'+ parameterName + "=" + parameterValue + (newQueryString.length>1?'&'+newQueryString.substring(1):'');
    } else {
        if (newQueryString !== "" && newQueryString != '?')
            newQueryString += "&";
        newQueryString += parameterName + "=" + (parameterValue?parameterValue:'');
    }
    return urlParts[0] + newQueryString + urlhash;
};

