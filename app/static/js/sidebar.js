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
