import os
import geojson
from flask import Flask, render_template, request, jsonify, url_for, redirect, Response
from flask_wtf.csrf import CSRFProtect
from .utils import define_function_jinja

from shapely.geometry import shape
from shapely.wkb import loads as loadswkb

from .database import (
    get_state_codes,
    query_random_og_cluster,
    query_filtered_clusters,
    query_filtered_og_clusters
)


STATE_CODES_DICT = get_state_codes()


def create_app(test_config=None):
    # create and configure the app
    app = Flask(
        __name__,
        static_folder='static',
        instance_relative_config=True,
    )
    app.config.from_mapping(
        SECRET_KEY='dev',
    )

    if test_config is None:
        # load the instance config, if it exists, when not testing
        app.config.from_pyfile('config.py', silent=True)
    else:
        # load the test config if passed in
        app.config.from_mapping(test_config)

    # ensure the instance folder exists
    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass

    # register blueprints (like views in django)

    csrf = CSRFProtect(app)

    @app.route('/')
    def index():
        defaultArgs = {
            "states_content": 1,
            "grid_content": 0
        }
        if request.args == {}:
            request.args = defaultArgs

        return render_template('index.html', **request.args)

    @app.route('/landing')
    def landing():
        return index()

    @app.route('/csv-export', methods=["GET"])
    def download_csv():
        args = request.args
        state = args.get("state")
        cluster_type = args.get("cluster_type")
        fname = args.get("state")

        if os.environ.get("POSTGRES_URL", None) is not None:
            if "og" in cluster_type:
                fname = fname + "_remotely_mapped_settlements"
                keys = (
                    'adm1_pcode',
                    'cluster_offgrid_id',
                    'area_km2',
                    'building_count',
                    'percentage_building_area',
                    'grid_dist_km'
                )
                records = query_filtered_og_clusters(
                    state,
                    STATE_CODES_DICT,
                    area=[args.get("ogmin_area"), args.get("ogmax_area")],
                    distance_grid=[args.get("ogmindtg"), args.get("ogmaxdtg")],
                    building=[args.get("ogminb"), args.get("ogmaxb")],
                    buildingfp=[args.get("ogminbfp"), args.get("ogmaxbfp")],
                    keys=keys
                )
            else:
                fname = fname + "_identified_settlements_by_satellite"
                keys = (
                    'adm1_pcode',
                    'cluster_all_id',
                    'fid',
                    'area_km2',
                    'grid_dist_km'
                )
                records = query_filtered_clusters(
                    state,
                    STATE_CODES_DICT,
                    area=[args.get("min_area"), args.get("max_area")],
                    distance_grid=[args.get("mindtg"), args.get("maxdtg")],
                    keys=keys
                )

            csv = list()
            csv.append(", ".join(keys))
            for line in records:
                csv.append(", ".join([str(line[k]) for k in keys]))
            csv = "\n".join(csv) + "\n"
        else:
            csv = "1,2,3\n4,5,6\n"
        return Response(
            csv,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename={}.csv".format(fname)}
        )

    @app.route('/filter-cluster', methods=["POST"])
    def filter_clusters():

        state_name = request.form.get("state_name")
        resp = query_random_og_cluster(state_name, STATE_CODES_DICT)
        # TODO: change the projection the one from the map
        geom = shape(loadswkb(str(resp.pop("geom")), hex=True))
        feature = geojson.Feature(
            id=resp.pop("cluster_offgrid_id"),
            geometry=geom,
            properties=resp
        )
        resp = jsonify(feature)
        resp.status_code = 200
        return resp

    define_function_jinja(app)
    return app
