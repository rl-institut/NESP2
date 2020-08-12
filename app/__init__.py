import os
import json
from flask import Flask, render_template, request, jsonify, url_for, safe_join, redirect, Response
from flask_wtf.csrf import CSRFProtect
from .utils import define_function_jinja
from .blueprints import resources
from .database import (
    get_state_codes,
    query_random_og_cluster,
    query_filtered_clusters,
    query_filtered_og_clusters,
    query_available_og_clusters,
    convert_web_mat_view_to_light_json
)

UNSUPPORTED_USER_AGENT_STRINGS = (
    "Edge",
    "MSIE",  # Internet Explorer
    "Trident"  # Internet Explorer (newer versions)
)

STATE_CODES_DICT = get_state_codes()
CODES_STATE_DICT = {v: k for k, v in STATE_CODES_DICT.items()}


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

    app.register_blueprint(resources.bp)

    @app.route('/')
    def index():
        user_agent = request.headers.get('User-Agent')
        not_supported = False
        for ua in UNSUPPORTED_USER_AGENT_STRINGS:
            if ua in user_agent:
                not_supported = True
        defaultArgs = {
            "states_content": 1,
            "grid_content": 0,
            "not_supported": not_supported
        }
        if request.args == {}:
            request.args = defaultArgs

        return render_template('index.html', **request.args)

    @app.route('/about-map')
    def about_map():
        return render_template('about-map.html')

    @app.route('/landing')
    def landing():
        return index()

    @app.route('/csv-export', methods=["GET"])
    def download_csv():
        args = request.args
        state = args.get("state")
        cluster_type = args.get("cluster_type")
        fname = state.replace(" ", "_")

        if os.environ.get("POSTGRES_URL", None) is not None:
            if "og" in cluster_type:
                fname = fname + "_remotely_mapped_settlements"
                keys = (
                    'adm1_pcode',
                    'cluster_offgrid_id',
                    'area_km2',
                    'building_count',
                    'percentage_building_area',
                    'grid_dist_km',
                    'ST_AsGeoJSON(centroid) as lnglat'
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
                    'grid_dist_km',
                    'ST_AsGeoJSON(centroid) as lnglat'
                )
                records = query_filtered_clusters(
                    state,
                    STATE_CODES_DICT,
                    area=[args.get("min_area"), args.get("max_area")],
                    distance_grid=[args.get("mindtg"), args.get("maxdtg")],
                    keys=keys
                )

            columns = list(keys)
            columns[-1] = "lnglat"
            column_names = list(keys)
            column_names[-1] = "longitude on WGS 84"
            column_names.append("latitude on WGS 84")
            csv = list()
            csv.append(", ".join(column_names))
            for line in records:
                csv_line = list()
                for k in columns:
                    if k == "lnglat":
                        lnglat = json.loads(line[k])["coordinates"]
                        csv_line.append(str(lnglat[0]))
                        csv_line.append(str(lnglat[1]))
                    else:
                        csv_line.append(str(line[k]))
                csv.append(", ".join(csv_line))
            csv = "\n".join(csv) + "\n"
        else:
            csv = "1,2,3\n4,5,6\n"
        return Response(
            csv,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename={}.csv".format(fname)}
        )

    @app.route('/states-with-og-clusters', methods=["POST"])
    def available_clusters():

        # query state codes for states with og clusters data
        resp = query_available_og_clusters()
        resp = jsonify({"states_with_og_clusters": [CODES_STATE_DICT[r] for r in resp]})
        resp.status_code = 200
        return resp

    @app.route('/centroids', methods=["get"])
    def fetch_centroids():
        state = request.args.get("state")
        cluster_type = request.args.get("cluster_type")
        if "og" in cluster_type:
            keys = (
                'adm1_pcode',
                'cluster_offgrid_id',
                'grid_dist_km',
                'area_km2',
                'building_count',
                'percentage_building_area',
                'ST_AsGeoJSON(bounding_box) as geom',
                'ST_AsGeoJSON(centroid) as lnglat'
            )
            COLS = (
                'cluster_offgrid_id',
                'area_km2',
                'grid_dist_km',
                'building_count',
                'percentage_building_area',
                'bEast',
                'bNorth',
                'bSouth',
                'bWest',
                'lat',
                'lng'
            )
            records = query_filtered_og_clusters(
                state,
                STATE_CODES_DICT,
                keys=keys,
            )
        else:
            keys = (
                'adm1_pcode',
                'cluster_all_id',
                'fid',
                'area_km2',
                'grid_dist_km',
                'ST_AsGeoJSON(bounding_box) as geom',
                'ST_AsGeoJSON(centroid) as lnglat'
            )
            COLS = (
                'cluster_all_id',
                'area_km2',
                'grid_dist_km',
                'fid',
                'bEast',
                'bNorth',
                'bSouth',
                'bWest',
                'lat',
                'lng'
            )
            records = query_filtered_clusters(
                state,
                STATE_CODES_DICT,
                keys=keys,
            )

        if records:
            answer = convert_web_mat_view_to_light_json(records, COLS)
        else:
            answer = {
                "adm1_pcode": STATE_CODES_DICT[state],
                "length": 0,
                "columns": COLS,
                "values": []
            }
        resp = jsonify(answer)
        resp.status_code = 200
        return resp

    @app.route('/random-cluster', methods=["POST"])
    def random_clusters():

        state_name = request.form.get("state_name")
        # query centroid with geometry as geojson
        resp = query_random_og_cluster(state_name, STATE_CODES_DICT)
        geom = json.loads(resp.pop("geom"))
        lnglat = json.loads(resp.pop("lnglat"))
        resp.update({
            'bNorth': geom["coordinates"][0][2][1],
            'bSouth': geom["coordinates"][0][0][1],
            'bEast': geom["coordinates"][0][2][0],
            'bWest': geom["coordinates"][0][0][0]
        })

        feature = dict(
            lng=lnglat["coordinates"][0],
            lat=lnglat["coordinates"][1],
            properties=resp
        )
        resp = jsonify(feature)
        resp.status_code = 200
        return resp


    @app.route('/filtered-cluster', methods=["POST"])
    def filtered_clusters():
        state = request.form.get("state_name")
        cluster_type = request.form.get("cluster_type")

        if os.environ.get("POSTGRES_URL", None) is not None:
            if "og" in cluster_type:
                keys = 'cluster_offgrid_id'

                records = query_filtered_og_clusters(
                    state,
                    STATE_CODES_DICT,
                    area=[request.form.get("ogminarea"), request.form.get("ogmaxarea")],
                    distance_grid=[request.form.get("ogmindtg"), request.form.get("ogmaxdtg")],
                    building=[request.form.get("ogminb"), request.form.get("ogmaxb")],
                    buildingfp=[request.form.get("ogminbfp"), request.form.get("ogmaxbfp")],
                    keys=keys
                )
            else:

                keys = 'cluster_all_id'
                records = query_filtered_clusters(
                    state,
                    STATE_CODES_DICT,
                    area=[request.form.get("minarea"), request.form.get("maxarea")],
                    distance_grid=[request.form.get("mindtg"), request.form.get("maxdtg")],
                    keys=keys
                )
        resp = jsonify(records[0].count)
        resp.status_code = 200
        return resp

    define_function_jinja(app)
    return app
