import os
import json
from flask import Flask, render_template, request, jsonify, url_for, redirect, Response
from flask_wtf.csrf import CSRFProtect
from .utils import define_function_jinja

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

    @app.route('/csv-export', methods=["POST"])
    def download_csv():
        json_str = [v for v in request.form.to_dict()]
        args = json.loads(json_str[0])

        state = args.get("state_name")
        cluster_type = args.get("cluster_type")
        print(cluster_type)
        if os.environ.get("POSTGRES_URL", None) is not None:
            keys = (
                'adm1_pcode',
                'cluster_offgrid_id',
                'area_km2',
                'building_count',
                'percentage_building_area',
                'grid_dist_km'
            )
            if "og" in cluster_type:
                records = query_filtered_og_clusters(
                    "Kano",
                    STATE_CODES_DICT,
                    area=[0.2, 0.6],
                    distance_grid=[10, 40],
                    keys=keys,
                    limit=3
                )
            else:
                records = query_filtered_clusters(
                    "Kano",
                    STATE_CODES_DICT,
                    area=[0.2, 0.6],
                    distance_grid=[10, 40],
                    keys=keys,
                    limit=3
                )

            print(records)
            csv = []
            csv.append(", ".join(keys))
            for line in records:
                csv.append(", ".join([str(line[k]) for k in keys]))
            csv = "\n".join(csv) + "\n"
        else:
            csv = "1,2,3\n,5,6\n"
        print(csv)
        return Response(
            csv,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename={}.csv".format(args.get("state"))}
        )

    @app.route('/filter-cluster', methods=["POST"])
    def filter_clusters():

        state_name = request.form.get("state_name")
        resp = jsonify(query_random_og_cluster(state_name, STATE_CODES_DICT))
        resp.status_code = 200
        return resp

    define_function_jinja(app)
    return app
