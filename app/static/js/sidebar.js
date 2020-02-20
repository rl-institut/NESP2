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


function adapt_sidebar_to_selection_level(selectionLevel) {

  var level_id =  selectionLevel.charAt(0)
  // hide and show elements according to their classes
  var hidelist = document.getElementsByClassName(level_id + "_hide");
  var showlist = document.getElementsByClassName(level_id + "_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].style.display = "none";
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].style.display = "block";
  }

  document.getElementById("national").className = "cell small-6 level sidebar__btn";
  document.getElementById("state").className = "cell small-6 level sidebar__btn";
  document.getElementById("village").className = "cell small-6 level sidebar__btn";

  document.getElementById(selectionLevel).className = "cell small-6 level sidebar__btn active";
};

function adapt_view_to_national_level() {
  map.options.minZoom = 6.6;
  map.options.maxZoom = 9;
  map.fitBounds([[2, 0],[15, 17]]); // [[S, W]],[[N, E]]

  // load the states boundaries
  document.getElementById("statesCheckbox").checked = true;
  states_cb_fun();
  // load the populated areas
  document.getElementById("heatmapCheckbox").checked = true;
  heatmap_cb_fun();
  // load the medium voltage grid
  document.getElementById("nationalGridCheckbox").checked = true;
  national_grid_cb_fun();

  // reset the selected state to None
  resetStateSelect()
  remove_layer(selected_state_pbf);

  remove_basemaps();

  map.addLayer(osm_gray);
  map.addLayer(national_background);

  // Remotely mapped villages layer
  remove_layer(ogclustersTileLayer);

  // Linked to the checkbox Grid
  remove_layer(grid_layer);
};

function adapt_view_to_state_level() {
  console.log("adapt_view_to_state_level");

  map.options.minZoom = 8;
  map.options.maxZoom = 19;

  // remove the populated areas and the medium voltage grid layers
  remove_layer(national_heatmap);
  remove_layer(national_grid);

  remove_basemaps_except_osm_gray();

  // load the states boundaries
  document.getElementById("statesCheckbox").checked = true;
  states_cb_fun();
  document.getElementById("gridCheckbox").checked = true;
  // Load the remotely mapped villages clusters
  document.getElementById("ogClustersCheckbox").checked = true;
  og_clusters_cb_fun();


  update_selected_state_pbf()
  update_grid_layer();

  add_layer(osm_gray);

  zoomToSelectedState();
};

/*
* triggered by the click on the level buttons
*/

function national_button_fun() {
  level="national";
  adapt_sidebar_to_selection_level(level);
  adapt_view_to_national_level()
}

function state_button_fun() {
  level="state";
  adapt_sidebar_to_selection_level(level);
  adapt_view_to_state_level();
};

function village_button_fun() {
  level="village";
  adapt_sidebar_to_selection_level(level);
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
  //update the selected state
  selectedState = document.getElementById("stateSelect").value;
  //Trigger the switch to state level
  state_button_fun();
};



// Triggered by the checkbox Populated Areas
function heatmap_cb_fun() {
  var checkBox = document.getElementById("heatmapCheckbox");
  if (checkBox.checked == true){
    add_layer(national_heatmap);
  }
  else {
    remove_layer(national_heatmap);
    national_heatmap.bringToFront();
  }
}

// Triggered by the checkbox Medium Voltage Grid
function national_grid_cb_fun() {
  var checkBox = document.getElementById("nationalGridCheckbox");
  if (checkBox.checked == true){
    add_layer(national_grid);
  }
  else {
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
    add_layer(vecTileLayer)
  } else {
    var j;
    for (j = 0; j < text.length; j++) {
      text[j].style.display = "none";
    }
    remove_layer(vecTileLayer)
  }

  $.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
    states_content: stateCheckBox.checked
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
    add_layer(ogclustersTileLayer)

  } else {
    var j;
    for (j = 0; j < text.length; j++) {
      text[j].style.display = "none";
    }
    remove_layer(ogclustersTileLayer)
  }
}

// Triggered by the checkbox Grid
function grid_cb_fun() {
  var checkBox = document.getElementById("gridCheckbox");
  if (checkBox.checked == true){
    add_layer(grid_layer);
  }
  else{
    remove_layer(grid_layer);
  }

  $.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
    states_content: stateCheckBox.checked
  },
  });
}

function building_density_cb_fun() {
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
    export_csv_link.href="/csv-export?min_area=" + currentfilter.minarea + ";max_area=" + currentfilter.maxarea
    export_csv_link.click()
}


function lga_cb_fun(){
  var checkBox = document.getElementById("lgaCheckbox");
  if (checkBox.checked == true){
    add_layer(lgas_pbf)
  }
  else {
    remove_layer(lgas_pbf)
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

