//$(document).foundation();

var areaSlider = document.getElementById('areaSlider');
noUiSlider.create(areaSlider, {
    start: [1, 5],
    connect: true,
    range: {
        'min': [0, 0],
        'max': [10,10],
    }
});

areaSlider.noUiSlider.on("change", function(str, h, values) {
    currentfilter.minarea = values[0];
    currentfilter.maxarea = values[1];
    map.fireEvent("filterchange", currentfilter);
});

var dtgSlider = document.getElementById('dtgSlider');
noUiSlider.create(dtgSlider, {
    start: [300, 1500],
    connect: true,
    range: {
        'min': [0, 0],
        'max': [3000,3000],
    }
});

function national_button_fun() {
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
  
  document.getElementById("statesCheckbox").checked = true;
  states_cb_fun();
  
  map.fitBounds([[4.153, 2.608],[13.892, 14.791]]);
  map.options.maxZoom = 7;
  if (map.hasLayer(selected_state_geojson) == true){
    map.removeLayer(selected_state_geojson);
  }
}

function state_button_fun() {
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

  document.getElementById("statesCheckbox").checked = false;
  states_cb_fun();
  if (map.hasLayer(selected_state_geojson) == false){
    map.addLayer(selected_state_geojson);
  }
}

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
    console.log(window.location.href)
  var checkBox = document.getElementById("statesCheckbox");
  console.log(checkBox);
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

  var checkBox = document.getElementById("gridCheckbox");
  if (checkBox.checked == true){
    if (map.hasLayer(gridLayer) == false){
      map.addLayer(gridLayer);
    }
  }
  if (checkBox.checked == false){
    if (map.hasLayer(gridLayer) == true){
      map.removeLayer(gridLayer);
    }
  }

  $.get({url: $SCRIPT_ROOT,
  data: {
    grid_content: gCheckBox.checked,
  },
  });


}

function grid_cb_fun() {
  var checkBox = document.getElementById("gridCheckbox");
  if (checkBox.checked == true){
    if (map.hasLayer(gridLayer) == false){
      map.addLayer(gridLayer);
    }
  }
  if (checkBox.checked == false){
    if (map.hasLayer(gridLayer) == true){
      map.removeLayer(gridLayer);
    }
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
