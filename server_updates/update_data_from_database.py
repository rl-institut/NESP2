import os
import random
from sqlalchemy import create_engine
from sqlalchemy import Table, MetaData
import geojson
from geojson import Point, Feature, FeatureCollection, dumps
from shapely.geometry import shape
from shapely.wkb import loads as loadswkb
from shapely.wkt import loads as loadswkt
import pandas as pd
import geopandas
import rtree

from shapely.geometry import Polygon, mapping, MultiPolygon
from shapely.ops import cascaded_union # could merge polygons

def get_env_variable(name):
    try:
        return os.environ[name]
    except KeyError:
        message = "Expected environment variable '{}' not set.".format(name)
        raise Exception(message)

POSTGRES_URL = get_env_variable("POSTGRES_URL")
POSTGRES_USER = get_env_variable("POSTGRES_USER")
POSTGRES_PW = get_env_variable("POSTGRES_PW")
POSTGRES_DB = get_env_variable("POSTGRES_DB")

DB_URL = 'postgresql+psycopg2://{user}:{pw}@{url}/{db}'.format(
    user=POSTGRES_USER,
    pw=POSTGRES_PW,
    url=POSTGRES_URL,
    db=POSTGRES_DB
)

def string_to_snake(string):
    return(string.lower().replace(' ', '_'))

engine = create_engine(DB_URL)
#tileserverlocation = "root@wam.rl-institut.de:/services/tileserver-gl/data/"
tileserverlocation = "integrationuser@52.166.49.216:/home/integrationuser/nesp2_data/"

# BOUNDARIES
# Download boundaries of Nigeria, its states and availabilities from database and store as geojson file


with engine.connect() as con:
    sql_availability_status = 'SELECT * FROM se4all.boundary_adm1_status;'
    sql_availability_status_df = pd.read_sql_query(sql_availability_status ,con)

with engine.connect() as con:
    sql = 'SELECT adm1_pcode, adm1_en, ST_TRANSFORM(boundary_adm1.geom,4326) as geom FROM se4all.boundary_adm1;'
    boundaries_gdf = geopandas.GeoDataFrame.from_postgis(sql, con)

# availability distribution_line_se4all/distribution_line_external = 4
# availability cluster_off_grid = 2
# availability survey = 1

sql_availability_status_df["availability"] = (sql_availability_status_df['distribution_line_se4all'] * 4 +
                                              sql_availability_status_df['distribution_line_external'] * 4 +
                                              sql_availability_status_df['cluster_offgrid'] * 2 +
                                              sql_availability_status_df['survey'] * 1
                                             )
#print(sql_availability_status_df["availability"])

boundaries_gdf = boundaries_gdf.merge(sql_availability_status_df, on="adm1_pcode", suffixes=('_x', ''))
boundaries_gdf.rename(columns={'adm1_en': 'name'}, inplace=True)

# create list of states from the dataframe created in boundaries
states_gdf = boundaries_gdf[['adm1_pcode', 'name', 'geom' ]]
StatesList = boundaries_gdf.name.unique()



# save boundaries to geojson file
boundaries_gdf.to_file("boundaries/boundaries_adm1_status_4326.geojson", driver='GeoJSON')

os.system('echo "var nigeria_states_simplified = " > boundaries/nigeria_states_availability.js')
os.system('cat boundaries/boundaries_adm1_status_4326.geojson >> boundaries/nigeria_states_availability.js')

# BOUNDARY TILES HAVE BECOME OBSOLETE
'''
# Copy boundary mbtiles and copy to tileserver
print("generating boundary tiles")
os.system('tippecanoe -L states_hr:boundaries/boundaries_adm1_status_4326.geojson -z15 -Z4 -pk -pf -f -o boundaries/nesp2_states_hr.mbtiles -S2')
print("Uploading boundary tiles")
os.system('scp boundaries/nesp2_states_hr.mbtiles root@wam.rl-institut.de:/services/tileserver-gl/data/nesp2_states_hr.mbtiles')
'''



# GRID
# Download the entire grid, filter by State and store as geojsons individually
# Used for State and Village Levels

# relevant columns: voltage_kv, distribution_line_id
# separate files by 11kV 33kV

print("Downloading Grid")
with engine.connect() as con:
    sql = 'SELECT source_distribution_line_id, voltage_kv, ST_TRANSFORM(distribution_line_all_mv.geom,4326) as geom FROM web.distribution_line_all_mv;'
    grid_web_gdf = geopandas.GeoDataFrame.from_postgis(sql, con)

# filter by voltage
grid_web_11_kv =  grid_web_gdf[grid_web_gdf.voltage_kv == 11]
grid_web_33_kv =  grid_web_gdf[grid_web_gdf.voltage_kv == 33]

# write grid geojson files
grid_web_11_kv.to_file("grid/geojson/nesp2_state_grid_11kv.geojson", driver='GeoJSON')
grid_web_33_kv.to_file("grid/geojson/nesp2_state_grid_33kv.geojson", driver='GeoJSON')

# generate vector tiles
input_path = "grid/geojson/"
output_path = "grid/vectortiles/"
command = "tippecanoe -L 11_kV:{}nesp2_state_grid_11kv.geojson -L 33_kV:{}nesp2_state_grid_33kv.geojson -z15 -Z4 -pk -pf -f -o {}nesp2_state_grid.mbtiles -S2".format(input_path, input_path, output_path)
print("Generating Grid tiles")
os.system(command)

# Upload Vector Tiles to Tileserver
print("Uploading Grid tiles")
command = 'scp grid/vectortiles/nesp2_state_grid.mbtiles {}nesp2_state_grid.mbtiles'.format(tileserverlocation)
os.system(command)


# OFFGRIDCLUSTERS
# Download, filter by state, add bounds and create geojsons as well as tiles.

# relevant columns: 'cluster_offgrid_id', 'area_km2', 'building_count', 'large_building_count', 
#                   'percentage_large_building', 'building_area_km2', 'building_count_density_perkm2',
#                   'percentage_building_area', 'grid_dist_km', 'geom'],

with engine.connect() as con:
    #sql = 'SELECT cluster_offgrid_id, area_km2, building_count, large_building_count, percentage_large_building, building_area_km2, building_count_density_perkm2, percentage_building_area, grid_dist_km, ST_TRANSFORM(cluster_offgrid.geom,4326) as geom FROM se4all.cluster_offgrid;'
    sql = 'SELECT adm1_pcode, cluster_offgrid_id, area_km2, building_count, percentage_building_area, grid_dist_km, ST_TRANSFORM(cluster_offgrid_mv.geom,4326) as geom FROM web.cluster_offgrid_mv;'
    print("Downloading Offgrid Cluster tiles from database")
    ogclusters_gdf = geopandas.GeoDataFrame.from_postgis(sql, con)

# add columns for bounds
ogclusters_gdf['bb_north'] = ogclusters_gdf.bounds['maxy']
ogclusters_gdf['bb_east'] = ogclusters_gdf.bounds['maxx']
ogclusters_gdf['bb_south'] = ogclusters_gdf.bounds['miny']
ogclusters_gdf['bb_west'] = ogclusters_gdf.bounds['minx']

# create dictionary of dataframes for all states
StatesDataFrameDictOGClusters = {elem : pd.DataFrame for elem in StatesList}

# fill dictionaries with offgrid cluster data of each state

for key in StatesDataFrameDictOGClusters.keys():
    StatesDataFrameDictOGClusters[key] = states_gdf[:][states_gdf.name == key]

for key in StatesDataFrameDictOGClusters.keys():
    boundary = StatesDataFrameDictOGClusters[key].iloc[0].geom
    StatesDataFrameDictOGClusters[key] = ogclusters_gdf[ogclusters_gdf.geometry.intersects(boundary)]

# write offgrid clusters to geojson files by state
for key in StatesDataFrameDictOGClusters.keys():
    if StatesDataFrameDictOGClusters[key].empty == False:
        StatesDataFrameDictOGClusters[key].to_file("cluster_offgrid/geojson/shapes/nesp2_state_offgrid_clusters_{}.geojson".format(string_to_snake(key)), driver='GeoJSON')

# write offgrid clusters centroids to geojson files by state
for key in StatesDataFrameDictOGClusters.keys():
    if StatesDataFrameDictOGClusters[key].empty == False:
        # copy dataframe to keep attributes, then set geometry to centroid
        centroids_gdf = StatesDataFrameDictOGClusters[key].copy()
        centroids_gdf['geom'] = StatesDataFrameDictOGClusters[key].centroid
        centroids_gdf.to_file("cluster_offgrid/geojson/centroids/nesp2_state_offgrid_clusters_centroids_{}.geojson".format(string_to_snake(key)), driver='GeoJSON')

# Create offgrid cluster Tiles
for key in StatesDataFrameDictOGClusters.keys():
    command = "tippecanoe -L OGClusters:"
    command += "cluster_offgrid/geojson/shapes/nesp2_state_offgrid_clusters_{}.geojson".format(string_to_snake(key))
    command += " -z19 -Z6 -pk -pf -f -o cluster_offgrid/tiles/nesp2_state_offgrid_clusters_{}.mbtiles -S2".format(string_to_snake(key))
    print("Generating Offgrid Cluster tiles")
    os.system(command)


# Upload offgrid cluster tiles to tileserver
print("Uploading Offgrid Cluster tiles")
os.system('scp cluster_offgrid/tiles/*.mbtiles {}'.format(tileserverlocation))




# ALLCLUSTERS
# Download, filter by state, add bounds and create geojsons as well as tiles.

# relevant columns: 'cluster_all_id', 'area_km2', grid_dist_km

print("Downloading All Clusters")
with engine.connect() as con:
    sql = 'SELECT cluster_all_id, area_km2, grid_dist_km, ST_TRANSFORM(cluster_all_mv.geom,4326) as geom FROM web.cluster_all_mv;'
    allclusters_gdf = geopandas.GeoDataFrame.from_postgis(sql, con)

# add columns for bounds
allclusters_gdf['bb_north'] = allclusters_gdf.bounds['maxy']
allclusters_gdf['bb_east'] = allclusters_gdf.bounds['maxx']
allclusters_gdf['bb_south'] = allclusters_gdf.bounds['miny']
allclusters_gdf['bb_west'] = allclusters_gdf.bounds['minx']

# create dictionary of dataframes for all states
StatesDataFrameDictAllClusters = {elem : pd.DataFrame for elem in StatesList}

# fill dictionaries with all cluster data of each state

for key in StatesDataFrameDictAllClusters.keys():
    StatesDataFrameDictAllClusters[key] = states_gdf[:][states_gdf.name == key]

for key in StatesDataFrameDictAllClusters.keys():
    boundary = StatesDataFrameDictAllClusters[key].iloc[0].geom
    StatesDataFrameDictAllClusters[key] = allclusters_gdf[allclusters_gdf.geometry.intersects(boundary)]

# write all clusters to geojson files by state
for key in StatesDataFrameDictAllClusters.keys():
    if StatesDataFrameDictAllClusters[key].empty == False:
        StatesDataFrameDictAllClusters[key].to_file("cluster_all/geojson/shapes/nesp2_state_all_clusters_{}.geojson".format(string_to_snake(key)), driver='GeoJSON')

# write all clusters centroids to geojson files by state
for key in StatesDataFrameDictAllClusters.keys():
    if StatesDataFrameDictAllClusters[key].empty == False:
        # copy dataframe to keep attributes, then set geometry to centroid
        centroids_gdf = StatesDataFrameDictAllClusters[key].copy()
        centroids_gdf['geom'] = StatesDataFrameDictAllClusters[key].centroid
        centroids_gdf.to_file("cluster_all/geojson/centroids/nesp2_state_state_all_clusters_centroids_{}.geojson".format(string_to_snake(key)), driver='GeoJSON')

# Create all cluster Tiles
for key in StatesDataFrameDictAllClusters.keys():
    command = "tippecanoe -L regions:"
    command += "cluster_all/geojson/shapes/nesp2_state_all_clusters_{}.geojson".format(string_to_snake(key))
    command += " -z17 -Z6 -pk -pf -f -o cluster_all/tiles/nesp2_state_clusters_{}.mbtiles -S2".format(string_to_snake(key))
    print("Generating All Cluster tiles")
    os.system(command)

# Upload offgrid cluster tiles to tileserver
print("Uploading All Cluster tiles")
os.system('scp cluster_all/tiles/*.mbtiles {}'.format(tileserverlocation))
