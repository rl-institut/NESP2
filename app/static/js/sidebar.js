function national_button_fun() {
  var hidelist = document.getElementsByClassName("n_hide");
  var showlist = document.getElementsByClassName("n_show");
  for (i = 0; i < hidelist.length; i++) {
    hidelist[i].style.display = "none";
  }
  for (j = 0; j < showlist.length; j++) {
    showlist[j].style.display = "block";
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
}

function states_cb_fun() {
  var checkBox = document.getElementById("states_cb");
  var text = document.getElementsByClassName("substate");
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

function clusters_cb_fun() {
  var checkBox = document.getElementById("clusters_cb");
  var text = document.getElementsByClassName("subcluster");
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
