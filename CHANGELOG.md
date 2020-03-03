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
- add next and previous buttons (#194)

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

### Removed
- redundant accordion menu (#10)
- redundant onclick function for nigeria_states_geojson layer (#108)


## [0.0.1] 2019-11-11

### Added
- content of https://github.com/catcad/nesp2 (#2)

