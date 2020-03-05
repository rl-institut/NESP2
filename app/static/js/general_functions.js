// Convert "a_string_name" to "A String Name"
function snake_to_title(fname){
  var state_name = fname.split('_').map(w => w[0].toUpperCase() + w.substr(1).toLowerCase());
  return state_name.join(' ');
};

// Convert "A String Name" to "a_string_name"
function title_to_snake(fname){
  var state_name = fname.split(' ').map(w => w.toLowerCase());
  return state_name.join('_');
};


