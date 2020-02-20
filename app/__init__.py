import os

from flask import Flask, render_template, request, jsonify, url_for, redirect
from utils import assign_visibility

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

    @app.route('/')
    def index():
        defaultArgs = {
            "states_content": 1,
            "grid_content": 0
        }
        if request.args == {}:
            request.args = defaultArgs

        return render_template('index.html', **request.args)

    @app.route('/csv-export')
    def download_csv():

        print(request.args)
        # TODO: perform a db search
        return render_template('index.html', **request.args)

    app.jinja_env.globals.update(assign_visibility=assign_visibility)
    return app
