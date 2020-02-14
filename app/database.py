import os
import pandas as pd
import geojson
from geojson import Feature, FeatureCollection
from shapely.geometry import Polygon, mapping, MultiPolygon
from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker


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


def list_materialized_view(engine):
    views = []
    with engine.connect() as con:
        rs = con.execute("""SELECT oid::regclass::text FROM   pg_class WHERE  relkind = 'm';""")

        for r in rs.fetchall():
            views.append(r[0])
    return views


def select_materialized_view(engine, view_name, schema=None, limit=None):
    if schema is not None:
        view_name = "{}.{}".format(schema, view_name)
    if limit is None:
        limit = ""
    else:
        limit = " LIMIT {}".format(limit)
    with engine.connect() as con:
        rs = con.execute('SELECT * FROM {}{};'.format(view_name, limit))
        data = rs.fetchall()
    return data


def select_geom_materialized_view(engine, view_name, schema=None, limit=None):
    """Gather all polygons in one geojson object

    :param engine: reference to the database
    :param view_name: name of the materialized view
    :param schema: name of the schema
    :param limit: max number of instances to query
    :return: a geosjon object
    """
    if schema is not None:
        view_name = "{}.{}".format(schema, view_name)
    if limit is None:
        limit = ""
    else:
        limit = " LIMIT {}".format(limit)
    with engine.connect() as con:
        rs = con.execute('SELECT ST_AsGeoJSON(geom) FROM {}{};'.format(view_name, limit))
        data = rs.fetchall()

    # collect each geojson (of type Polygon)
    polygons = []
    for el in data:
        gm = geojson.loads(el[0])["coordinates"]
        polygons.append(Polygon([(coor[0], coor[1]) for coor in gm[0]]))

    # reform a geojson with a MultiPolygon
    geom = mapping(MultiPolygon(polygons))
    return geom
