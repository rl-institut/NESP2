$(document).foundation();

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
  var checkBox = document.getElementById("statesCheckbox");
  var text = document.getElementsByName("statesContent");
  if (checkBox.checked == true){
    var i;
    for (i = 0; i < text.length; i++) {
      text[i].style.display = "block";
    }
  } else {
    var j;
    for (j = 0; j < text.length; j++) {
      text[j].style.display = "none";
    }
    if (map.hasLayer(statesLayer)){
      map.removeLayer(statesLayer);
    }
  }
}

function states_radio_fun() {
  var radio = document.getElementsByName("statesGroup");
  var selection = "";
  if (map.hasLayer(statesLayer)){
    map.removeLayer(statesLayer);
  }
  for (i = 0; i < radio.length; i++) {
    if (radio[i].checked == true) {selection = (radio[i].id);}
  }
  if (selection == "gridtrackingCB"){
    statesStyle = statesStyle1;
  }
  if (selection == "remotemappingCB"){
    statesStyle = statesStyle2;
  }
  if (selection == "surveyingCB"){
    statesStyle = statesStyle3;
  }
  if (map.hasLayer(statesLayer) == false){
    map.addLayer(statesLayer);
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
  } else {
    var j;
    for (j = 0; j < text.length; j++) {
      text[j].style.display = "none";
    }
  }
}
