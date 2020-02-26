import os

from flask import Flask, render_template, request, jsonify, url_for, redirect, Response
from flask_wtf.csrf import CSRFProtect
from .utils import define_function_jinja

from .database import get_state_codes, query_random_og_cluster

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

    @app.route('/csv-export')
    def download_csv():

        print(request.args)
        args = dict(request.args)
        # TODO: perform a db search

        csv = '1,2,3\n4,5,6\n'
        return Response(
            csv,
            mimetype="text/csv",
            headers={"Content-disposition": "attachment; filename={}.csv".format(args["state"])}
        )

    @app.route('/filter-cluster', methods=["POST"])
    def filter_clusters():

        state_name = request.form.get("state_name")
        resp = jsonify(query_random_og_cluster(state_name, STATE_CODES_DICT))
        resp.status_code = 200
        return resp

    define_function_jinja(app)
    return app
