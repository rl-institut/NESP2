import os
import json
import pandas as pd
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker
from sqlalchemy.sql import text
import geoalchemy2
from sqlalchemy import Table, MetaData
from sqlalchemy.ext.declarative import declarative_base
import random
from geojson import Point, Feature, FeatureCollection
from shapely.wkt import loads as loadswkt


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

engine = create_engine(DB_URL)
db_session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))

Base = declarative_base(metadata=MetaData(schema='se4all', bind=engine))


class BoundaryAdmin(Base):
    __table__ = Table('boundary_adm1', Base.metadata, autoload=True, autoload_with=engine)


class AdmStatus(Base):
    __table__ = Table('boundary_adm1_status', Base.metadata, autoload=True, autoload_with=engine)

class GenerationAssets(Base):
    __table__ = Table(
        "generation_assets", Base.metadata, autoload=True, autoload_with=engine
    )


def query_available_og_clusters():
    """Look for state which have true set for both clusters and og_clusters"""
    res = db_session.query(
        AdmStatus.adm1_pcode
    ).filter(AdmStatus.cluster_all & AdmStatus.cluster_offgrid).all()
    return [r.adm1_pcode for r in res]

def get_state_codes():
    res = db_session.query(
        BoundaryAdmin.adm1_pcode.label("code"),
        BoundaryAdmin.adm1_en.label("name")
    )
    return {r.name:r.code for r in res}

OG_CLUSTERS_COLUMNS = ('adm1_pcode', 'cluster_offgrid_id', 'area_km2',
    'building_count', 'percentage_building_area', 'grid_dist_km', 'geom')


def query_generation_assets():
    """Look for on and off grid generation assets"""

    res = db_session.query(
        GenerationAssets.name,
        geoalchemy2.functions.ST_AsText(
            geoalchemy2.functions.ST_GeomFromWKB(GenerationAssets.geom, srid=3857)
        ).label("geom"),
        GenerationAssets.capacity_kw,
        GenerationAssets.asset_type,
        GenerationAssets.technology_type,
    )

    features = []
    for r in res:
        if r.geom is not None:
            gjson = Feature(
                geometry=Point(loadswkt(r.geom).coords[0]),
                properties={
                    "name": r.name,
                    "capacity_kw": r.capacity_kw,
                    "technology_type": r.technology_type,
                    "asset_type": r.asset_type
                },
            )
            features.append(gjson)

    return FeatureCollection(features)


def filter_materialized_view(
        engine,
        view_name,
        schema="web",
        state_code=None,
        area=None,
        distance_grid=None,
        building=None,
        buildingfp=None,
        limit=None,
        keys=None,
):
    """

    :param engine:
    :param view_name: name of the view in the database (NOT A USER INPUT)
    :param schema: name of the schema in the database (NOT A USER INPUT)
    :param state_code: admin code of nigerian state (PROOFED USER INPUT)
    :param area: boundaries for settlement's area filter (USER INPUT)
    :param distance_grid: boundaries for settlement's distance to grid filter (USER INPUT)
    :param building: boundaries for settlement's building count filter (USER INPUT)
    :param buildingfp: boundaries for settlement's building percentage of area filter (USER INPUT)
    :param limit: boundaries for settlement area filter (NOT A USER INPUT)
    :param keys: list of columns to query values from (NOT A USER INPUT)
    :return: returned data from the query
    """

    # to hold query parameters
    values = {}

    if schema is not None:
        view_name = "{}.{}".format(schema, view_name)

    if limit is None:
        limit = ""
    else:
        values["limit"] = int(limit)
        limit = " LIMIT :limit"

    filter_cond = []

    if state_code is not None:
        key = "adm1_pcode"
        filter_cond += [f"{view_name}.{key} = :{key}"]
        values[key] = state_code

    if area is not None:
        key = "area_km2"
        val1 = key + "_1"
        val2 = key + "_2"
        filter_cond += [f"{view_name}.{key} >= :{val1}", f"{view_name}.{key} <= :{val2}"]
        values[val1] = float(area[0])
        values[val2] = float(area[1])

    if distance_grid is not None:
        key = "grid_dist_km"
        val1 = key + "_1"
        val2 = key + "_2"
        filter_cond += [f"{view_name}.{key} >= :{val1}", f"{view_name}.{key} <= :{val2}"]
        values[val1] = float(distance_grid[0])
        values[val2] = float(distance_grid[1])

    if building is not None:
        key = "building_count"
        val1 = key + "_1"
        val2 = key + "_2"
        filter_cond += [f"{view_name}.{key}>=:{val1}", f"{view_name}.{key}<=:{val2}"]
        values[val1] = int(building[0])
        values[val2] = int(building[1])

    if buildingfp is not None:
        key = "percentage_building_area"
        val1 = key + "_1"
        val2 = key + "_2"
        filter_cond += [f"{view_name}.{key}>=:{val1}", f"{view_name}.{key}<=:{val2}"]
        values[val1] = float(buildingfp[0])
        values[val2] = float(buildingfp[1])

    if keys is None:
        columns = "*"
    else:
        if not isinstance(keys, str):
            columns = ", ".join(keys)
        else:
            columns = "COUNT({})".format(keys)

    if len(filter_cond) > 0:
        filter_cond_str = " WHERE " + " AND ".join(filter_cond)
    else:
        filter_cond_str = ""

    with engine.connect() as con:
        query = 'SELECT {} FROM {}{}{};'.format(columns, view_name, filter_cond_str, limit)
        rs = con.execute(text(query), **values)
        data = rs.fetchall()
    return data


def convert_web_mat_view_to_light_json(records, cols):
    """

    :param records:
    :param cols:
    :return:
    """
    df = pd.DataFrame()

    for l in records:
        l = dict(l)
        geom = json.loads(l.pop("geom"))
        lnglat = json.loads(l.pop("lnglat"))

        l.update({
            'lat': lnglat["coordinates"][1],
            'lng': lnglat["coordinates"][0],
            'bNorth': geom["coordinates"][0][2][1],
            'bSouth': geom["coordinates"][0][0][1],
            'bEast': geom["coordinates"][0][2][0],
            'bWest': geom["coordinates"][0][0][0]
        })
        df = df.append(l, ignore_index=True)

    value_list = []
    for c in cols:
        value_list = value_list + df[c].to_list()

    return {'adm1_pcode': df['adm1_pcode'].unique()[0], "length": len(df.index), "columns": cols,
            "values": value_list}


def query_filtered_clusters(
        state_name,
        state_codes_dict,
        area=None,
        distance_grid=None,
        limit=None,
        keys=None
):
    """

    :param state_name:
    :param state_codes_dict:
    :param area:
    :param distance_grid:
    :param limit:
    :param keys:
    :return:
    """

    if state_name in state_codes_dict:
        view_name = "cluster_all_mv"
        answer = filter_materialized_view(
            engine,
            view_name,
            schema="web",
            state_code=state_codes_dict[state_name],
            area=area,
            distance_grid=distance_grid,
            limit=limit,
            keys=keys
        )
    else:
        print("Non existent state name: {}".format(state_name))
        answer = []
    return answer


def query_filtered_og_clusters(
        state_name,
        state_codes_dict,
        area=None,
        distance_grid=None,
        building=None,
        buildingfp=None,
        limit=None,
        keys=None
):
    """

    :param state_name:
    :param state_codes_dict:
    :param area:
    :param distance_grid:
    :param building:
    :param buildingfp:
    :param limit:
    :param keys:
    :return:
    """

    if state_name in state_codes_dict:
        view_name = "cluster_offgrid_mv"
        answer = filter_materialized_view(
            engine,
            view_name,
            schema="web",
            state_code=state_codes_dict[state_name],
            area=area,
            distance_grid=distance_grid,
            building=building,
            buildingfp=buildingfp,
            limit=limit,
            keys=keys
        )
    else:
        print("Non existent state name: {}".format(state_name))
        answer = []
    return answer


def get_number_of_entries(engine, view_code, schema="web", table_name="cluster_offgrid"):
    """

    :param engine:
    :param view_code:
    :param schema:
    :return:
    """

    if schema is not None:
        view_name = "{}.{}_{}_mv".format(schema, table_name, view_code)
    with engine.connect() as con:
        rs = con.execute('SELECT count(*) as n FROM {};'.format(view_name))
        data = rs.fetchall()
    return data[0].n


def query_row_count_cluster(state_code):
    return get_number_of_entries(engine, state_code, schema="web", table_name="cluster_all")


def query_row_count_ogcluster(state_code):
    return get_number_of_entries(engine, state_code, schema="web", table_name="cluster_offgrid")


def get_random_og_cluster(engine, view_code, schema="web", limit=5):
    """Select a random cluster from a given view

    :param engine: database engine
    :param view_name: the state code of the view formatted as "ngXYZ"
    :param schema: the name of the database schema
    :param limit: the number of villages to choose from
    :return: the information of one cluster : 'adm1_pcode', 'cluster_offgrid_id', 'area_km2',
    'building_count', 'percentage_building_area', 'grid_dist_km', 'geom'
    """

    if schema is not None:
        view_name = "{}.cluster_offgrid_mv".format(schema, view_code)
    cols = ", ".join(OG_CLUSTERS_COLUMNS[:-1])
    cols = cols + ", ST_AsGeoJSON(bounding_box) as geom, ST_AsGeoJSON(centroid) as lnglat"
    with engine.connect() as con:
        rs = con.execute("SELECT {} FROM {} WHERE adm1_pcode='{}' ORDER BY area_km2 DESC LIMIT {};".format(
                cols,
                view_name,
                view_code,
                limit
            )
        )
        data = rs.fetchall()
    single_cluster = data[random.randint(0, min([int(limit), len(data)])-1)]
    return {key: str(single_cluster[key]) for key in OG_CLUSTERS_COLUMNS + ("geom", "lnglat")}


def query_random_og_cluster(state_name, state_codes_dict):
    return get_random_og_cluster(engine=engine, view_code=state_codes_dict[state_name])
