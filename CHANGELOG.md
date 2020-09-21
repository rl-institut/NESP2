# Changelog
All notable changes to this project will be documented in this file.

The format is inspired from [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and the versioning aim to respect [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

Here is a template for new release sections

```
## [_._._] - 20XX-MM-DD

### Added
-
### Changed
-
### Removed
-
```

## [Unreleased]
### Added
- Centroid latitude and longitude information in csv file download (#299)
- Popup to warn against unsupported browsers (#311)
- Links back to main page and to data portal (#318)
- Visible button for data portal link (#319)
- Video popup upon landing on main endpoint (#320, #321, #322, #323)
### Changed
- Cluster toggles in sidebar automatically switch on or off depending on OG clusters availability
 (#303)
- Rename `gridCheckbox` to `stateGridCheckbox (#312)
- Rename `grid_layer` to `state_grid_layer (#312)
- Keep the darker funnel image as long as filter is expanded (#326)
- The area legend is not shaped like a line anymore but like a rectangle (#327)
### Removed
- Unused `selectedStateAvailability` variable (#303)
- Unused `statesAvailability` variable (#303)
- Javascript code in `index.html` to initialize state_grid and state_level toggles (#312)


## [1.0.0] 2020-04-27

### Added
- Satellite imagery layer (#7)
- GridLayer (#10)
- clusters sliders for area and distance to grid (#12)
- clusters switch (#12)
- radio buttons that load different styles(#15)
- dropdown option selectability
- foundation structure and styles (#10)
- flask structure (#21)
- base html template (#53)
- link `style.css` for integration into website (#76)
- filter icon for filter (#82)
- State Level Layers for Off-Grid-Clusters (#89)
- Cluster styling (#95)
- possibility to "grey out" a sidebar panel item (#115)
- filter to geoJSON layer which prevent the selected state cover the clusters (#115)
- the level change between state and village based on the zoom (#122)
- clicking on the funnel expand the filters (#128)
- the user can click on Download clusters (#128)
- possibility to hide, show or grey-out sidepane-items (#136)
- loading spinner (#174, #192)
- clicking on village button will randomly select a cluster in a random state (#175)
- clicking on state button will randomly select a state
- ability to download the information about settlements clusters in a csv file (#156)
- add next and previous buttons (#205)
- number of selected clusters by the filter selection (#213)
- function to generate the control of clusters (#220)
- endpoint for querying clusters info in the database (#221)
- Favicon (#258)
- Link to refresh page when clicking on blitz logo (#258)
- Hover on filter icon highlights it + tooltip (#263)
- Replace tilelayer for borders with geojson (#267)
- Show Number of selected cluster (#239)
- Filter the cluster by area (#274)
- Warning popup if screen width is below 1024 pixels (#281)
- Link to "about this map" opens in new tab (#289)

### Changed
- Filter slider get reasonable steps (#167)
- availability info moved
- level buttons indicate status (#9)
- level buttons control options (#10)
- sidebar style (#10)
- reworked state view (#52)
- update leaflet version (#53)
- split page using grid-x rather than css (#53)
- Menu item naming (#77)
- layout of side panel (#82)
- zoom all the way to clicked cluster (#89)
- the State button is not active anymore, selection through click or menu (#105)
- states borders are still visible in State level, one can hover on other states (#105)
- no initial selected state in National level, user must choose (#105)
- the selected state cannot be clicked or selected again (#109)
- sidebar panels are defined via a template sidebar_checkbox.html (#115)
- the side panel checkboxes are now grey out when not used (#128)
- the grid and populated buttons appear now as the same button to the user (#136)
- index.py is now at the root of the repository (#142)
- increased the map height to 1000px (#148)
- Levelbuttons in sidebar next to each other (#137)
- Styling of filtersubmenue (#137)
- Replaced lines of static code with for loops (#155)
- Split the filter events for og clusters and normal clusters (#155)
- Make sure the clusters layers on a state are properly removed once the user select another state or national level (#220)
- Make sure to remember selected cluster when flyto zooms out too far (#68)
- Adapt minZoom in national Level so user can zoom out again (#240, #250)
- About this map link (#247)
- The clusters info for a state are now downloaded stored into a variable client side as the user select the state (#221)
- Made toggle buttons keep the on/off state the user provided them (#250, #252)
- Adapt maximum Native Zooms (#210)
- Kano is no longer the only randomly selected state (#252)
- Info box for state is displayed on top left (#261)
- Info box has also info for selected state when mouse over over it or outside Nigeria (#261)
- Draw tiles from azure tileserver (#269)
- Drop two elements in info box (#271)
- Change to clusterInfo legend box to match required design (#266)
- The `filter_centroid_keys` function is only called in `update_filter` (#274)
- The `filtered_centroids_keys` variable is only accessed via get and set functions (#274)
- Endpoint `/filtered-cluster` is not used anymore to get filter info, rather it is the `filtered_centroids_keys` function (#274)
- Adapt filters to show clusters that are 0km distance from grid (#278, #280)
- Filter are not clickable if screen width is below 1024 pixels (#281)
- Browsing settlements works periodically (#289)
- Distance to grid is shown as 0 km when selected (#305)

### Removed
- redundant accordion menu (#10)
- redundant onclick function for nigeria_states_geojson layer (#108)
- outline around components after being clicked on (#202)
- lgas layers and options (#221)
- unused map layers in map control (#258)
- Remove the randomCluster info box (#266)
- Function `update_centroids_group` (#274)


## [0.0.1] 2019-11-11

### Added
- content of https://github.com/catcad/nesp2 (#2)