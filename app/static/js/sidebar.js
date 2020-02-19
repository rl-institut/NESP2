var level = "national";
var statesList = ["Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "Federal Capital Territory", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"];
var selectedState = "init";
var selectedLGA = "";
var thirtythreeKV = "33_kV_" + selectedState.toLowerCase();
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




function resetStateSelect(){
    selectedState = "init"
    var s = document.getElementById('stateSelect')
    console.log(s.options)
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
    start: [1, 5],
    range: {
        'min': 0,
        'max': 10,
    },
});

areaSlider.noUiSlider.on("change", changeAreaSlider);

var dtgSlider = document.getElementById('dtgSlider');
noUiSlider.create(dtgSlider, {
    ...sliderOptions,
    start: [300, 1500],
    range: {
        'min': 0,
        'max': 3000,
    }
});


var ogAreaSlider = document.getElementById('ogAreaSlider');
noUiSlider.create(ogAreaSlider, {
    ...sliderOptions,
    start: [1, 5],
    range: {
        'min': 0,
        'max': 10,
    }
});

ogAreaSlider.noUiSlider.on("change", changeAreaSlider);

var ogPopulationSlider = document.getElementById('ogPopulationSlider');
noUiSlider.create(ogPopulationSlider, {
    start: [300, 1500],
    ...sliderOptions,
    range: {
        'min': 0,
        'max': 3000,
    }
});


function adapt_sidebar_to_national_level() {
  var hidelist = document.getElementsByClassName("n_hide");
  var showlist = document.getElementsByClassName("n_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].style.display = "none";
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].style.display = "block";
  }
  document.getElementById("national").className = "cell small-6 level sidebar__btn active";
  document.getElementById("state").className = "cell small-6 level sidebar__btn";
  document.getElementById("village").className = "cell level sidebar__btn";
};

function adapt_view_to_national_level() {
  document.getElementById("statesCheckbox").checked = true;
  // reset the selected state to None

  resetStateDropdown()
  states_cb_fun();
  national_grid_cb_fun();
  heatmap_cb_fun();
  map.options.minZoom = 6.6;
  map.options.maxZoom = 9;
  map.fitBounds([[2, 0],[15, 17]]); // [[S, W]],[[N, E]]
  remove_basemaps();
  map.addLayer(osm_gray);
  map.addLayer(national_background);
  remove_layer(ogclustersTileLayer);
  remove_selected_state_pbf();
  remove_grid_layer();
};

function national_button_fun() {
  document.getElementById("heatmapCheckbox").checked = true;
  document.getElementById("nationalGridCheckbox").checked = true;
  adapt_sidebar_to_national_level();
  adapt_view_to_national_level();
}

function adapt_sidebar_to_state_level(){
  var hidelist = document.getElementsByClassName("s_hide");
  var showlist = document.getElementsByClassName("s_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].style.display = "none";
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].style.display = "block";
  }
  document.getElementById("national").className = "cell small-6 level sidebar__btn";
  document.getElementById("state").className = "cell small-6 level sidebar__btn active";
  document.getElementById("village").className = "cell level sidebar__btn";
};

function adapt_view_to_state_level() {
  states_cb_fun();
  og_clusters_cb_fun();
  add_selected_state_pbf();
  update_grid_layer();
  map.options.minZoom = 8;
  map.options.maxZoom = 19;
  zoomToSelectedState();
  remove_layer(national_heatmap);
  remove_layer(national_grid);
  map.addLayer(osm_gray);
  remove_basemaps_except_osm_gray();
};

function state_button_fun() {
  document.getElementById("statesCheckbox").checked = false;
  document.getElementById("gridCheckbox").checked = true;
  document.getElementById("ogClustersCheckbox").checked = true;
  adapt_sidebar_to_state_level();
  adapt_view_to_state_level();
};

function village_button_fun() {
  var hidelist = document.getElementsByClassName("v_hide");
  var showlist = document.getElementsByClassName("v_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].style.display = "none";
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].style.display = "block";
  }
  document.getElementById("national").className = "cell small-6 level sidebar__btn";
  document.getElementById("state").className = "cell small-6 level sidebar__btn";
  document.getElementById("village").className = "cell level sidebar__btn active";
}

function states_cb_fun() {
  var checkBox = document.getElementById("statesCheckbox");
  if (checkBox.checked == true){
    if (map.hasLayer(statesLayer) == false){
      map.addLayer(statesLayer);
    }
    if (map.hasLayer(nigeria_states_geojson) == false){
      map.addLayer(nigeria_states_geojson);
    }
  }
  else {
    if (map.hasLayer(statesLayer)){
      map.removeLayer(statesLayer);
    }
    if (map.hasLayer(nigeria_states_geojson)){
      map.removeLayer(nigeria_states_geojson);
    }
  }

//https://stackoverflow.com/questions/31765968/toggle-url-parameter-with-button
//https://dev.to/gaels/an-alternative-to-handle-global-state-in-react-the-url--3753
//https://stackoverflow.com/questions/13063838/add-change-parameter-of-url-and-redirect-to-the-new-url/13064060
  $.get({url: $SCRIPT_ROOT,
  data: {
    states_content: checkBox.checked,
  },
  });

}

function heatmap_cb_fun() {
  var checkBox = document.getElementById("heatmapCheckbox");
  if (checkBox.checked == true){
    add_layer(national_heatmap);
  }
  if (checkBox.checked == false){
    remove_layer(national_heatmap);
    national_heatmap.bringToFront();
  }
}

function national_grid_cb_fun() {
  var checkBox = document.getElementById("nationalGridCheckbox");
  if (checkBox.checked == true){
    add_layer(national_grid);
  }
  if (checkBox.checked == false){
    remove_layer(national_grid);
  }
}

function clusters_cb_fun() {
  var checkBox = document.getElementById("clustersCheckbox");
  var text = document.getElementsByName("clustersContent");
  if (checkBox.checked == true){
    var i;
    for (i = 0; i < text.length; i++) {
      text[i].style.display = "block";
    }
    if (map.hasLayer(vecTileLayer) == false){
      map.addLayer(vecTileLayer);
    }
  } else {
    var j;
    for (j = 0; j < text.length; j++) {
      text[j].style.display = "none";
    }
    if (map.hasLayer(vecTileLayer) == true){
      map.removeLayer(vecTileLayer);
    }
  }

  $.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
  },
  });
}

function og_clusters_cb_fun() {
  var checkBox = document.getElementById("ogClustersCheckbox");
  var text = document.getElementsByName("ogClustersContent");
  if (checkBox.checked == true){
    var i;
    for (i = 0; i < text.length; i++) {
      text[i].style.display = "block";
    }
    if (map.hasLayer(ogclustersTileLayer) == false){
      map.addLayer(ogclustersTileLayer);
    }
  } else {
    var j;
    for (j = 0; j < text.length; j++) {
      text[j].style.display = "none";
    }
    if (map.hasLayer(ogclustersTileLayer) == true){
      map.removeLayer(ogclustersTileLayer);
    }
  }
}

function grid_cb_fun() {
  var checkBox = document.getElementById("gridCheckbox");
  if (checkBox.checked == true){
    add_grid_layer();
  }
  if (checkBox.checked == false){
    remove_grid_layer();
  }

  $.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
  },
  });
}

function building_density_cb_fun() {
  var checkBox = document.getElementById("buildingDensityCheckbox");
  if (checkBox.checked == true){
    if (map.hasLayer(buildingDensity) == false){
      map.addLayer(buildingDensity);
    }
  }
  if (checkBox.checked == false){
    if (map.hasLayer(buildingDensity) == true){
      map.removeLayer(buildingDensity);
    }
  }
}

function download_clusters_fun() {
    var export_csv_link = document.getElementById("export_csv")
    export_csv_link.href="/csv-export?min_area=" + currentfilter.minarea + ";max_area=" + currentfilter.maxarea
    export_csv_link.click()
}


function lga_cb_fun(){
  var checkBox = document.getElementById("lgaCheckbox");
  if (checkBox.checked == true){
    if (map.hasLayer(lgas_pbf) == false){
      map.addLayer(lgas_pbf);
    }
  }
  if (checkBox.checked == false){
    if (map.hasLayer(lgas_pbf) == true){
      map.removeLayer(lgas_pbf);
    }
  }
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

function state_dropdown_fun(){
  remove_selected_state_pbf();
  remove_grid_layer();
  dd_selection = document.getElementById("stateSelect");
  change_state_fun(state);
  if (level != "state"){
    level = state;
    state_button_fun();
  }
};

function change_state_fun(state){
  selectedState = dd_selection.value;
  update_selected_state_pbf();
  update_grid_layer();
  zoomToSelectedState();
};
